import pandas as pd
import json
from typing import List, Tuple
import io

class DataInputHandler:
    @staticmethod
    def parse_csv(file_content: bytes) -> Tuple[List[dict], List[str]]:
        """Parse CSV file and detect text columns"""
        try:
            df = pd.read_csv(io.BytesIO(file_content))
            
            # Auto-detect text columns (columns with predominantly string values)
            text_columns = []
            for col in df.columns:
                if df[col].dtype == 'object':  # String/object type
                    non_null_count = df[col].notna().sum()
                    if non_null_count / len(df) > 0.8:  # At least 80% non-null
                        text_columns.append(col)
            
            # Convert to list of dicts
            data = df.to_dict('records')
            return data, text_columns
        
        except Exception as e:
            raise Exception(f"CSV parsing error: {str(e)}")
    
    @staticmethod
    def parse_json(file_content: bytes) -> Tuple[List[dict], List[str]]:
        """Parse JSON file"""
        try:
            data = json.loads(file_content.decode('utf-8'))
            
            if not isinstance(data, list):
                data = [data]
            
            # Detect text columns
            text_columns = []
            if data:
                for key in data[0].keys():
                    if isinstance(data[0][key], str):
                        text_columns.append(key)
            
            return data, text_columns
        
        except Exception as e:
            raise Exception(f"JSON parsing error: {str(e)}")
    
    @staticmethod
    def parse_manual_text(text_input: str, separator: str = '\n') -> List[dict]:
        """Parse manually entered text"""
        try:
            lines = text_input.strip().split(separator)
            data = [
                {'text': line.strip()} 
                for line in lines 
                if line.strip()
            ]
            return data
        
        except Exception as e:
            raise Exception(f"Text parsing error: {str(e)}")
    
    @staticmethod
    def extract_text_from_data(data: List[dict], text_columns: List[str]) -> List[str]:
        """Extract text entries from parsed data"""
        texts = []
        
        for item in data:
            text_parts = []
            for col in text_columns:
                if col in item and item[col]:
                    text_parts.append(str(item[col]))
            
            if text_parts:
                combined_text = ' '.join(text_parts)
                texts.append(combined_text)
        
        return texts
    
    @staticmethod
    def validate_file(file_object, allowed_extensions: List[str] = None) -> Tuple[bool, str]:
        """Validate uploaded file"""
        if allowed_extensions is None:
            allowed_extensions = ['csv', 'json']
        
        if not file_object:
            return False, "No file selected"
        
        filename = file_object.name.lower()
        ext = filename.split('.')[-1]
        
        if ext not in allowed_extensions:
            return False, f"File type '.{ext}' not allowed. Use: {', '.join(allowed_extensions)}"
        
        # Check file size (max 10MB)
        file_size_mb = file_object.size / (1024 * 1024)
        if file_size_mb > 10:
            return False, "File size exceeds 10MB limit"
        
        return True, "Valid"
    
    @staticmethod
    def prepare_data_for_analysis(data: List[dict], text_column: str) -> List[dict]:
        """Prepare data for sentiment analysis"""
        prepared_data = []
        
        for item in data:
            if text_column in item and item[text_column]:
                prepared_item = {
                    'text': str(item[text_column]),
                    'date': item.get('date'),
                    'source': item.get('source'),
                    'rating': item.get('rating')
                }
                prepared_data.append(prepared_item)
        
        return prepared_data


def load_data_from_file(file_object) -> Tuple[List[dict], List[str]]:
    """Load and parse data from file"""
    handler = DataInputHandler()
    
    # Validate file
    valid, message = handler.validate_file(file_object)
    if not valid:
        raise ValueError(message)
    
    filename = file_object.name.lower()
    file_content = file_object.read()
    
    if filename.endswith('.csv'):
        return handler.parse_csv(file_content)
    elif filename.endswith('.json'):
        return handler.parse_json(file_content)
    else:
        raise ValueError("Unsupported file format")

def load_data_from_text(text_input: str) -> List[dict]:
    """Load data from manual text input"""
    handler = DataInputHandler()
    return handler.parse_manual_text(text_input)
