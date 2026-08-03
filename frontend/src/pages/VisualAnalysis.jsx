import React, { useState } from 'react';

export default function VisualAnalysis() {
  const [images, setImages] = useState([]);

  const handleFiles = (files) => {
    const incoming = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
      sentiment: ['Positive', 'Neutral', 'Negative'][Math.floor(Math.random() * 3)],
      confidence: Math.round((60 + Math.random() * 40) * 10) / 10,
      quality: Math.round((70 + Math.random() * 25) * 10) / 10,
      highlight: ['Brand visibility', 'Product packaging', 'Emotion tone'][Math.floor(Math.random() * 3)]
    }));
    setImages(incoming);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ fontWeight: '800', fontSize: '18px' }}>Visual Sentiment Analysis</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '4px' }}>
            Upload images, screenshots, or product visuals and get a quick visual sentiment summary.
          </p>
        </div>
        <label className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          Upload images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {images.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontWeight: '800', marginBottom: '12px', fontSize: '15px' }}>Visual Analytics Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="metric-card">
                <div className="metric-label">Images analyzed</div>
                <div className="metric-value">{images.length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Average confidence</div>
                <div className="metric-value">{(images.reduce((sum, item) => sum + item.confidence, 0) / images.length).toFixed(1)}%</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Positive visuals</div>
                <div className="metric-value">{images.filter((item) => item.sentiment === 'Positive').length}</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Quality score</div>
                <div className="metric-value">{(images.reduce((sum, item) => sum + item.quality, 0) / images.length).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontWeight: '800', marginBottom: '12px', fontSize: '15px' }}>Visual Scan Details</h4>
            <div style={{ display: 'grid', gap: '16px' }}>
              {images.map((item, idx) => (
                <div key={idx} className="card" style={{ padding: '14px', display: 'grid', gap: '10px' }}>
                  <img src={item.url} alt={`uploaded-${idx}`} style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', maxHeight: '180px' }} />
                  <div style={{ display: 'grid', gap: '5px' }}>
                    <div style={{ fontWeight: '800' }}>Result</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span className="badge badge-emerald" style={{ padding: '6px 10px' }}>{item.sentiment}</span>
                      <span className="badge badge-slate">{item.confidence}% confidence</span>
                      <span className="badge badge-sky">{item.highlight}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-3)' }}>
                      <span>Quality {item.quality}%</span>
                      <span>{item.file.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)' }}>
          Upload one or more images to see inferred visual sentiment and quality metrics.
        </div>
      )}
    </div>
  );
}
