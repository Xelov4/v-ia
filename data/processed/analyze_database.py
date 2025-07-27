#!/usr/bin/env python3
import csv
from collections import Counter
import re

def analyze_database(filename):
    """Analyse la base de données et fournit des statistiques détaillées"""
    
    tools = []
    categories = Counter()
    tags = Counter()
    
    with open(filename, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter=';')
        
        for row in reader:
            tools.append(row)
            
            # Compte les catégories
            if row['tool_category']:
                categories[row['tool_category']] += 1
            
            # Compte les tags
            if row['tags']:
                tag_list = [tag.strip() for tag in row['tags'].split(',') if tag.strip()]
                for tag in tag_list:
                    tags[tag] += 1
    
    print("=== ANALYSE DE LA BASE DE DONNÉES D'OUTILS IA ===\n")
    
    # Statistiques générales
    print(f"📊 STATISTIQUES GÉNÉRALES:")
    print(f"   • Nombre total d'outils: {len(tools)}")
    print(f"   • Nombre de catégories uniques: {len(categories)}")
    print(f"   • Nombre de tags uniques: {len(tags)}")
    
    # Outils avec des liens valides
    tools_with_links = [t for t in tools if t['tool_link'] and t['tool_link'].startswith('http')]
    print(f"   • Outils avec liens valides: {len(tools_with_links)}")
    
    # Outils avec images
    tools_with_images = [t for t in tools if t['image_url'] and t['image_url'].startswith('http')]
    print(f"   • Outils avec images: {len(tools_with_images)}")
    
    print("\n" + "="*60 + "\n")
    
    # Top 20 des catégories
    print("🏷️  TOP 20 DES CATÉGORIES:")
    for i, (category, count) in enumerate(categories.most_common(20), 1):
        percentage = (count / len(tools)) * 100
        print(f"   {i:2d}. {category:<25} {count:4d} outils ({percentage:5.1f}%)")
    
    print("\n" + "="*60 + "\n")
    
    # Top 20 des tags
    print("🏷️  TOP 20 DES TAGS:")
    for i, (tag, count) in enumerate(tags.most_common(20), 1):
        percentage = (count / len(tools)) * 100
        print(f"   {i:2d}. {tag:<25} {count:4d} occurrences ({percentage:5.1f}%)")
    
    print("\n" + "="*60 + "\n")
    
    # Exemples d'outils par catégorie
    print("🔍 EXEMPLES D'OUTILS PAR CATÉGORIE:")
    category_examples = {}
    for tool in tools:
        category = tool['tool_category']
        if category and category not in category_examples:
            category_examples[category] = tool['tool_name']
    
    for category, tool_name in list(category_examples.items())[:10]:
        count = categories[category]
        print(f"   • {category:<25} ({count:3d} outils) - Exemple: {tool_name}")
    
    print("\n" + "="*60 + "\n")
    
    # Analyse des audiences cibles
    print("👥 ANALYSE DES AUDIENCES CIBLES:")
    audience_keywords = Counter()
    for tool in tools:
        if tool['target_audience']:
            audiences = tool['target_audience'].split(',')
            for audience in audiences:
                audience = audience.strip().lower()
                if audience:
                    audience_keywords[audience] += 1
    
    print("   Top 15 des audiences cibles:")
    for i, (audience, count) in enumerate(audience_keywords.most_common(15), 1):
        print(f"   {i:2d}. {audience:<30} {count:4d} outils")
    
    print("\n" + "="*60 + "\n")
    
    # Analyse des cas d'usage
    print("💡 ANALYSE DES CAS D'USAGE:")
    use_case_keywords = Counter()
    for tool in tools:
        if tool['use_cases']:
            use_cases = tool['use_cases'].split(',')
            for use_case in use_cases:
                use_case = use_case.strip().lower()
                if use_case:
                    use_case_keywords[use_case] += 1
    
    print("   Top 15 des cas d'usage:")
    for i, (use_case, count) in enumerate(use_case_keywords.most_common(15), 1):
        print(f"   {i:2d}. {use_case:<40} {count:4d} outils")
    
    print("\n" + "="*60 + "\n")
    
    # Outils récents ou populaires (avec des liens valides)
    print("⭐ OUTILS NOTABLES (avec liens valides):")
    valid_tools = [t for t in tools if t['tool_link'] and t['tool_link'].startswith('http')]
    
    for i, tool in enumerate(valid_tools[:10], 1):
        category = tool['tool_category'] or "Non catégorisé"
        print(f"   {i:2d}. {tool['tool_name']:<25} - {category}")
        if tool['overview']:
            overview = tool['overview'][:60] + "..." if len(tool['overview']) > 60 else tool['overview']
            print(f"       {overview}")
        print()

if __name__ == "__main__":
    analyze_database("working_database_rationalized_full.csv") 