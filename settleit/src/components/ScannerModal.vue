```
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5QrcodeScanner } from 'html5-qrcode'
import Tesseract from 'tesseract.js'
import * as pdfjsLib from 'pdfjs-dist'
import { 
  QrCode, 
  FileText, 
  X, 
  Camera, 
  Loader,
  FileUp
} from 'lucide-vue-next'
import { parseUpiQrCode, extractExpenseFromOcr } from '../utils/scannerUtils'

// Configure PDF.js worker with proper HTTPS URL
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const props = defineProps({
  mode: {
    type: String,
    default: 'qr', // 'qr' or 'ocr'
    validator: (value) => ['qr', 'ocr'].includes(value)
  }
})

const emit = defineEmits(['close', 'scan-success'])

const scanning = ref(false)
const processing = ref(false)
const error = ref('')
const capturedImage = ref(null)
const extractedData = ref(null)
const ocrProgress = ref(0)

let qrScanner = null

onMounted(() => {
  if (props.mode === 'qr') {
    initQrScanner()
  }
})

onUnmounted(() => {
  if (qrScanner) {
    qrScanner.clear()
  }
})

const initQrScanner = () => {
  scanning.value = true
  error.value = ''
  
  qrScanner = new Html5QrcodeScanner(
    'qr-reader',
    { 
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    },
    false
  )

  qrScanner.render(onQrScanSuccess, onQrScanError)
}

const onQrScanSuccess = (decodedText) => {
  scanning.value = false
  processing.value = true
  
  const parsedData = parseUpiQrCode(decodedText)
  
  if (parsedData) {
    extractedData.value = {
      description: parsedData.merchantName,
      amount: parsedData.amount,
      category: 'Other',
      notes: parsedData.transactionNote,
      source: 'qr'
    }
    
    if (qrScanner) {
      qrScanner.clear()
    }
    
    processing.value = false
    emit('scan-success', extractedData.value)
  } else {
    error.value = 'Could not parse QR code. Please try again.'
    processing.value = false
  }
}

const onQrScanError = (err) => {
  // Suppress continuous errors during scanning
  if (!err.includes('NotFoundException')) {
    console.error('QR Scan error:', err)
  }
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    processing.value = true
    error.value = ''

    // Check if it's a PDF
    if (file.type === 'application/pdf') {
      await handlePdfUpload(file)
    } else {
      // Handle image file
      const reader = new FileReader()
      reader.onload = async (e) => {
        capturedImage.value = e.target.result
        await performOcr(file)
      }
      reader.readAsDataURL(file)
    }
  } catch (err) {
    console.error('Error uploading file:', err)
    error.value = 'Failed to process file. Please try again.'
    processing.value = false
  }
}

const handlePdfUpload = async (file) => {
  try {
    processing.value = true
    error.value = ''
    
    console.log('[PDF] Starting PDF upload:', file.name, 'Size:', file.size)
    
    // Read PDF file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    console.log('[PDF] File read as ArrayBuffer, size:', arrayBuffer.byteLength)
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    console.log('[PDF] PDF loaded successfully, pages:', pdf.numPages)
    
    // Extract text from all pages
    let fullText = ''
    const numPages = pdf.numPages
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()
      
      // Improved text extraction preserving spatial layout
      // Group text items by their Y position (rows in table)
      const textByRow = {}
      
      textContent.items.forEach(item => {
        const y = Math.round(item.transform[5]) // Y position
        if (!textByRow[y]) {
          textByRow[y] = []
        }
        textByRow[y].push({
          text: item.str.trim(),
          x: item.transform[4] // X position for column ordering
        })
      })
      
      // Sort rows by Y position (top to bottom)
      const sortedRows = Object.keys(textByRow)
        .map(y => parseInt(y))
        .sort((a, b) => b - a) // Descending (top to bottom)
      
      // Build text with preserved row structure
      let pageText = ''
      sortedRows.forEach(y => {
        // Sort items in row by X position (left to right)
        const rowItems = textByRow[y].sort((a, b) => a.x - b.x)
        const rowText = rowItems.map(item => item.text).filter(t => t.length > 0).join(' ')
        if (rowText.trim()) {
          pageText += rowText + '\n'
        }
      })
      
      fullText += pageText + '\n'
      console.log(`[PDF] Page ${pageNum} text length:`, pageText.length)
      
      // Update progress
      ocrProgress.value = Math.round((pageNum / numPages) * 100)
    }
    
    console.log('[PDF] Full extracted text length:', fullText.length)
    console.log('[PDF] First 500 chars:', fullText.substring(0, 500))
    
    // Create a visual representation (render first page)
    const page = await pdf.getPage(1)
    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise
    
    capturedImage.value = canvas.toDataURL()
    console.log('[PDF] First page rendered to canvas')
    
    // Process extracted text through OCR extraction logic
    if (fullText.trim()) {
      const parsedData = extractExpenseFromOcr(fullText)
      console.log('[PDF] Parsed data:', parsedData)
      
      extractedData.value = {
        description: parsedData.merchantName,
        amount: parsedData.amount,
        category: parsedData.category,
        date: parsedData.date,
        items: parsedData.items,
        notes: `Scanned from PDF: ${file.name}`,
        source: 'pdf',
        rawOcrText: parsedData.rawText
      }
      
      processing.value = false
      emit('scan-success', extractedData.value)
    } else {
      console.error('[PDF] No text extracted from PDF')
      processing.value = false
      error.value = 'No text found in PDF. This might be a scanned/image PDF. Please try converting to JPG/PNG first.'
    }
    
  } catch (err) {
    console.error('[PDF] Error processing PDF:', err)
    console.error('[PDF] Error details:', err.message, err.stack)
    error.value = `Failed to extract text from PDF: ${err.message}. Please try an image file (JPG/PNG) instead.`
    processing.value = false
  }
}

const performOcr = async (file) => {
  try {
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            ocrProgress.value = Math.round(m.progress * 100)
          }
        }
      }
    )
    
    const ocrText = result.data.text
    const parsedData = extractExpenseFromOcr(ocrText)
    
    extractedData.value = {
      description: parsedData.merchantName,
      amount: parsedData.amount,
      category: parsedData.category,
      date: parsedData.date,
      items: parsedData.items,
      notes: `Scanned from receipt`,
      source: 'ocr',
      rawOcrText: parsedData.rawText
    }
    
    processing.value = false
    emit('scan-success', extractedData.value)
    
  } catch (err) {
    console.error('OCR error:', err)
    error.value = 'Failed to scan receipt. Please try again.'
    processing.value = false
  }
}

const handleClose = () => {
  if (qrScanner) {
    qrScanner.clear()
  }
  emit('close')
}
</script>

<template>
  <div class="scanner-modal-backdrop" @click.self="handleClose">
    <div class="scanner-modal">
      <div class="modal-header">
        <div class="header-content">
          <component :is="mode === 'qr' ? QrCode : FileText" :size="24" class="header-icon" />
          <div>
            <h2>{{ mode === 'qr' ? 'Scan QR Code' : 'Scan Receipt' }}</h2>
            <p class="subtitle">
              {{ mode === 'qr' ? 'Position the QR code within the frame' : 'Upload a clear photo of your receipt' }}
            </p>
          </div>
        </div>
        <button class="close-btn" @click="handleClose">
          <X :size="24" />
        </button>
      </div>

      <div class="modal-body">
        <!-- QR Scanner View -->
        <div v-if="mode === 'qr'" class="scanner-container">
          <div v-if="scanning" id="qr-reader" class="qr-reader"></div>
          
          <div v-if="processing" class="processing-state">
            <Loader :size="48" class="spinner" />
            <p>Processing QR code...</p>
          </div>
        </div>

        <!-- OCR Scanner View -->
        <div v-else class="scanner-container">
          <div v-if="!capturedImage" class="upload-area">
            <FileUp :size="64" class="upload-icon" />
            <h3>Upload Receipt</h3>
            <p>Upload an image (JPG, PNG) or PDF document</p>
            <label for="receipt-upload" class="upload-btn">
              <Camera :size="18" />
              <span>Choose File</span>
            </label>
            <input 
              id="receipt-upload" 
              type="file" 
              accept="image/*,application/pdf" 
              capture="environment"
              @change="handleImageUpload"
              hidden
            >
            <p class="upload-hint">Supported: JPG, PNG, PDF</p>
          </div>

          <div v-else class="preview-area">
            <img :src="capturedImage" alt="Receipt" class="receipt-preview" />
            
            <div v-if="processing" class="processing-overlay">
              <Loader :size="48" class="spinner" />
              <p>Scanning receipt...</p>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${ocrProgress}%` }"></div>
              </div>
              <span class="progress-text">{{ ocrProgress }}%</span>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="error-message">
          <span>⚠️ {{ error }}</span>
        </div>
      </div>

      <div class="modal-footer">
        <button class="text-btn" @click="handleClose">Cancel</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scanner-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.scanner-modal {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  flex: 1;
}

.header-icon {
  color: #5025d1;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.subtitle {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.close-btn {
  background: #f1f5f9;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748b;
  flex-shrink: 0;
  position: relative;
  z-index: 100;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.scanner-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* QR Scanner Styles */
:deep(#qr-reader) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(#qr-reader video) {
  border-radius: 12px;
}

:deep(#qr-reader__dashboard_section) {
  display: none !important;
}

.processing-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #5025d1;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* OCR Upload Styles */
.upload-area {
  text-align: center;
  padding: 3rem 2rem;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  background: #f8fafc;
}

.upload-icon {
  color: #94a3b8;
  margin-bottom: 1rem;
}

.upload-area h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.upload-area p {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #5025d1;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.upload-btn:hover {
  background: #4020b0;
}

.preview-area {
  width: 100%;
  position: relative;
}

.receipt-preview {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 12px;
}

.processing-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  border-radius: 12px;
  color: #5025d1;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #5025d1, #8b5cf6);
  transition: width 0.3s;
  border-radius: 4px;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.text-btn {
  background: none;
  border: 2px solid #e2e8f0;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  transition: all 0.2s;
  position: relative;
  z-index: 10;
}

.text-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}
</style>
