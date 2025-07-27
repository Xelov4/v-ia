#!/usr/bin/env python3
import csv
import re

def clean_text(text):
    """Nettoie le texte en supprimant les caractères problématiques"""
    if not text:
        return ""
    # Supprime les caractères de contrôle et normalise les espaces
    text = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def merge_fields(fields, start_idx, count):
    """Fusionne plusieurs champs en un seul"""
    result = []
    for i in range(count):
        if start_idx + i < len(fields):
            field = clean_text(fields[start_idx + i])
            if field:
                result.append(field)
    return ', '.join(result)

def process_csv(input_file, output_file):
    """Traite le fichier CSV et le convertit en format rationalisé"""
    
    with open(input_file, 'r', encoding='utf-8', errors='ignore') as infile:
        reader = csv.reader(infile, delimiter=';')
        
        with open(output_file, 'w', encoding='utf-8', newline='') as outfile:
            writer = csv.writer(outfile, delimiter=';')
            
            # En-tête rationalisé
            header = [
                'tool_name', 'tool_category', 'tool_link', 'overview', 
                'tool_description', 'target_audience', 'key_features', 
                'use_cases', 'tags', 'image_url'
            ]
            writer.writerow(header)
            
            # Traite chaque ligne
            for row_num, row in enumerate(reader, 1):
                # Ignore les lignes vides
                if not row or all(not field.strip() for field in row):
                    continue
                
                # Ignore les lignes avec seulement des points-virgules
                if len(row) == 1 and row[0].strip() == '':
                    continue
                
                # Ignore la ligne d'en-tête si elle contient "tool_name"
                if row_num == 1 and 'tool_name' in row[0].lower():
                    continue
                
                try:
                    # Extrait et nettoie les champs
                    tool_name = clean_text(row[0]) if len(row) > 0 else ""
                    tool_category = clean_text(row[1]) if len(row) > 1 else ""
                    tool_link = clean_text(row[2]) if len(row) > 2 else ""
                    overview = clean_text(row[3]) if len(row) > 3 else ""
                    tool_description = clean_text(row[4]) if len(row) > 4 else ""
                    
                    # Fusionne les champs "who" (audience cible)
                    target_audience = merge_fields(row, 5, 4)
                    
                    # Fusionne les champs "key_features"
                    key_features = merge_fields(row, 9, 4)
                    
                    # Fusionne les champs "use_cases"
                    use_cases = merge_fields(row, 13, 4)
                    
                    # Fusionne les tags
                    tags = merge_fields(row, 17, 2)
                    
                    # Image URL
                    image_url = clean_text(row[19]) if len(row) > 19 else ""
                    
                    # Écrit la ligne rationalisée seulement si tool_name n'est pas vide
                    if tool_name:
                        new_row = [
                            tool_name, tool_category, tool_link, overview,
                            tool_description, target_audience, key_features,
                            use_cases, tags, image_url
                        ]
                        
                        writer.writerow(new_row)
                    
                except Exception as e:
                    print(f"Erreur à la ligne {row_num}: {e}")
                    continue

if __name__ == "__main__":
    input_file = "working_database_cleaned.csv"
    output_file = "working_database_rationalized_full.csv"
    
    print("Traitement du fichier CSV...")
    process_csv(input_file, output_file)
    print(f"Fichier traité et sauvegardé dans {output_file}")
    
    # Affiche quelques statistiques
    with open(output_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        print(f"Nombre total d'outils traités: {len(lines) - 1}")  # -1 pour l'en-tête 