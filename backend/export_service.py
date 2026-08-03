import pandas as pd
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.lib.units import inch
from reportlab.lib import colors
import io
from datetime import datetime
import json

class ExportService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom styles for PDF"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#0ea5e9'),
            spaceAfter=30,
            alignment=1
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1f2937'),
            spaceAfter=12,
            spaceBefore=12
        ))
    
    def export_to_csv(self, analysis_results: list, filename: str = None) -> bytes:
        """Export results to CSV"""
        try:
            df = pd.DataFrame(analysis_results)
            
            if filename is None:
                filename = f"sentiment_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            
            # Select relevant columns
            columns_to_export = ['text', 'sentiment', 'confidence', 'emotion', 'date', 'source']
            available_columns = [col for col in columns_to_export if col in df.columns]
            
            csv_buffer = io.StringIO()
            df[available_columns].to_csv(csv_buffer, index=False)
            
            return csv_buffer.getvalue().encode('utf-8')
        
        except Exception as e:
            raise Exception(f"CSV export error: {str(e)}")
    
    def export_to_pdf(self, analysis_name: str, summary: dict, 
                     top_results: list, filename: str = None) -> bytes:
        """Export results to PDF report"""
        try:
            if filename is None:
                filename = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            
            pdf_buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                pdf_buffer,
                pagesize=letter,
                rightMargin=0.75*inch,
                leftMargin=0.75*inch,
                topMargin=0.75*inch,
                bottomMargin=0.75*inch
            )
            
            elements = []
            
            # Title
            title = Paragraph(
                f"Sentiment Analysis Report: {analysis_name}",
                self.styles['CustomTitle']
            )
            elements.append(title)
            
            # Generation date
            date_text = Paragraph(
                f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M:%S')}",
                self.styles['Normal']
            )
            elements.append(date_text)
            elements.append(Spacer(1, 0.3*inch))
            
            # Summary section
            elements.append(Paragraph("Executive Summary", self.styles['CustomHeading']))
            
            if summary:
                sentiment_dist = summary.get('sentiment_distribution', {})
                
                summary_text = f"""
                <b>Total Entries Analyzed:</b> {summary.get('total_entries', 0)}<br/>
                <b>Positive:</b> {sentiment_dist.get('Positive', {}).get('count', 0)} 
                ({sentiment_dist.get('Positive', {}).get('percentage', 0)}%)<br/>
                <b>Negative:</b> {sentiment_dist.get('Negative', {}).get('count', 0)} 
                ({sentiment_dist.get('Negative', {}).get('percentage', 0)}%)<br/>
                <b>Neutral:</b> {sentiment_dist.get('Neutral', {}).get('count', 0)} 
                ({sentiment_dist.get('Neutral', {}).get('percentage', 0)}%)<br/>
                <b>Average Confidence:</b> {summary.get('avg_confidence', 0)}%
                """
                
                elements.append(Paragraph(summary_text, self.styles['Normal']))
            
            elements.append(Spacer(1, 0.2*inch))
            
            # Key Insights
            if summary.get('key_insights'):
                elements.append(Paragraph("Key Insights", self.styles['CustomHeading']))
                for insight in summary['key_insights']:
                    insight_para = Paragraph(f"• {insight}", self.styles['Normal'])
                    elements.append(insight_para)
                elements.append(Spacer(1, 0.2*inch))
            
            # Top Keywords
            if summary.get('top_keywords'):
                elements.append(Paragraph("Top Keywords", self.styles['CustomHeading']))
                keywords_text = ", ".join(summary['top_keywords'][:10])
                elements.append(Paragraph(keywords_text, self.styles['Normal']))
                elements.append(Spacer(1, 0.2*inch))
            
            # Top Positive Reviews
            if summary.get('top_positive_reviews'):
                elements.append(Paragraph("Top Positive Reviews", self.styles['CustomHeading']))
                for review in summary['top_positive_reviews'][:3]:
                    review_para = Paragraph(f"✓ {review[:100]}...", self.styles['Normal'])
                    elements.append(review_para)
                elements.append(Spacer(1, 0.2*inch))
            
            # Top Negative Reviews
            if summary.get('top_negative_reviews'):
                elements.append(Paragraph("Top Negative Reviews", self.styles['CustomHeading']))
                for review in summary['top_negative_reviews'][:3]:
                    review_para = Paragraph(f"✗ {review[:100]}...", self.styles['Normal'])
                    elements.append(review_para)
            
            # Build PDF
            doc.build(elements)
            pdf_buffer.seek(0)
            return pdf_buffer.getvalue()
        
        except Exception as e:
            raise Exception(f"PDF export error: {str(e)}")
    
    def export_to_json(self, analysis_data: dict, filename: str = None) -> bytes:
        """Export results to JSON"""
        try:
            if filename is None:
                filename = f"analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            json_str = json.dumps(analysis_data, indent=2, default=str)
            return json_str.encode('utf-8')
        
        except Exception as e:
            raise Exception(f"JSON export error: {str(e)}")


def export_results(results: list, format: str = 'csv', **kwargs) -> bytes:
    """Helper function to export results"""
    service = ExportService()
    
    if format.lower() == 'csv':
        return service.export_to_csv(results, **kwargs)
    elif format.lower() == 'pdf':
        return service.export_to_pdf(**kwargs)
    elif format.lower() == 'json':
        return service.export_to_json(**kwargs)
    else:
        raise ValueError(f"Unsupported format: {format}")
