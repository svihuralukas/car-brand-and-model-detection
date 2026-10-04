import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { detectCar } from '../api'
import ResultCard from '../components/ResultCard'
import styles from './DetectPage.module.css'

function DetectPage() {
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length === 0) return
    const f = acceptedFiles[0]
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10 MB.')
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
    setError(null)
    setResult(null)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1
  })

  const handleDetect = async () => {
    if (!file) {
      setError('Please select an image first')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const detection = await detectCar(file)
      setResult(detection)
    } catch (err) {
      setError(err.message || 'Detection failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPreview(null)
    setFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <div>
          <h1>Detect Vehicle</h1>
          <p className={styles.subtitle}>Upload a car image and let AI identify the brand</p>
        </div>
      </div>

      {!preview ? (
        <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.dropzoneActive : ''}`}>
          <input {...getInputProps()} />
          <div className={styles.dropzoneInner}>
            <div className={styles.dropIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M8 32L16 24L22 30L32 18L40 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
                <circle cx="14" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M24 38V44M20 44H28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <p className={styles.dropText}>
              {isDragActive ? 'Drop your image here' : 'Drag & drop a car photo'}
            </p>
            <p className={styles.dropHint}>or click to browse · JPG, PNG, WEBP · max 10 MB</p>
          </div>
        </div>
      ) : (
        <div className={styles.previewSection}>
          <div className={styles.previewWrapper}>
            <img src={preview} alt="Car preview" className={styles.previewImage} />
            <button onClick={handleReset} className={styles.resetBtn} title="Remove image">✕</button>
          </div>
          <div className={styles.actions}>
            <button onClick={handleDetect} disabled={loading} className={styles.detectBtn}>
              {loading ? (
                <span className={styles.loadingState}>
                  <span className={styles.spinner}></span>
                  Analyzing...
                </span>
              ) : (
                'Detect Vehicle'
              )}
            </button>
          </div>
        </div>
      )}

      {error && <div className={styles.error}>{error}</div>}
      {result && <ResultCard result={result} preview={preview} />}
    </div>
  )
}

export default DetectPage
