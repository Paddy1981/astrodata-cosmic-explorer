"""
AstroData - Interactive Astronomy Explorer
Democratizing Space Education with Unique Perspectives
"""

import streamlit as st
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime, date, timedelta
import folium
from streamlit_folium import st_folium
import math

# Set page config
st.set_page_config(
    page_title="AstroData - Explore the Universe",
    page_icon="✦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Theme state
if "theme" not in st.session_state:
    st.session_state["theme"] = "dark"


def get_theme_css(theme):
    """Generate CSS based on theme - Aligned with laruneng.com branding"""
    if theme == "dark":
        return """
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cardo:wght@400;700&display=swap');
            :root {
                --bg-primary: #190c00;
                --bg-secondary: #2a1a0a;
                --bg-card: rgba(6, 147, 227, 0.1);
                --text-primary: #ffffff;
                --text-secondary: #b8a898;
                --accent-1: #0693e3;
                --accent-2: #0069e3;
                --accent-gold: #d4a853;
                --border-color: rgba(6, 147, 227, 0.3);
            }
            .stApp {
                background-color: var(--bg-primary);
                font-family: 'Inter', sans-serif;
            }
            [data-testid="stSidebar"] {
                background-color: var(--bg-secondary);
                border-right: 1px solid rgba(212, 168, 83, 0.2);
            }
            h1, h2, h3 { font-family: 'Cardo', serif; }
        </style>
        """
    else:  # light theme - matching laruneng.com
        return """
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cardo:wght@400;700&display=swap');
            :root {
                --bg-primary: #eaeaea;
                --bg-secondary: #ffffff;
                --bg-card: rgba(6, 147, 227, 0.08);
                --text-primary: #190c00;
                --text-secondary: #5a4a3a;
                --accent-1: #0693e3;
                --accent-2: #0069e3;
                --accent-gold: #d4a853;
                --border-color: rgba(25, 12, 0, 0.15);
            }
            .stApp {
                background-color: var(--bg-primary);
                font-family: 'Inter', sans-serif;
            }
            [data-testid="stSidebar"] {
                background-color: var(--bg-secondary);
                border-right: 1px solid var(--border-color);
            }
            .stMarkdown, .stText, p, span, div { color: var(--text-primary) !important; }
            h1, h2, h3, h4, h5, h6 {
                color: var(--text-primary) !important;
                font-family: 'Cardo', serif;
            }
        </style>
        """


# Base CSS (theme-independent) - Aligned with laruneng.com
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cardo:wght@400;700&display=swap');

    /* Logo styling - Larun Engineering style */
    .logo-container {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        margin-bottom: 0.5rem;
    }
    .logo-icon {
        font-size: 3.5rem;
        background: linear-gradient(135deg, #0693e3 0%, #0069e3 50%, #d4a853 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
    }
    .main-header {
        font-size: 2.8rem;
        font-weight: 700;
        font-family: 'Cardo', serif;
        background: linear-gradient(135deg, #0693e3 0%, #d4a853 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        letter-spacing: -1px;
    }
    .sub-header {
        text-align: center;
        color: #5a4a3a;
        font-size: 1.1rem;
        margin-bottom: 1.5rem;
        font-weight: 400;
        font-family: 'Inter', sans-serif;
    }
    /* Cards - Larun Engineering style */
    .cosmic-card {
        background: linear-gradient(135deg, rgba(6, 147, 227, 0.08), rgba(212, 168, 83, 0.08));
        border: 1px solid rgba(6, 147, 227, 0.25);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 1rem 0;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        font-family: 'Inter', sans-serif;
    }
    .cosmic-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(6, 147, 227, 0.15);
        border-color: rgba(6, 147, 227, 0.4);
    }
    .insight-text {
        font-size: 1.1rem;
        line-height: 1.8;
        font-family: 'Inter', sans-serif;
    }
    .wow-stat {
        font-size: 2.5rem;
        font-weight: bold;
        font-family: 'Cardo', serif;
        background: linear-gradient(90deg, #d4a853, #0693e3);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .location-badge {
        background: rgba(6, 147, 227, 0.15);
        color: #0693e3;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        display: inline-block;
        margin: 0.25rem;
        font-family: 'Inter', sans-serif;
    }
    /* Modern button styling - Larun style */
    .share-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
    .share-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    /* Gradient text helper */
    .gradient-text {
        background: linear-gradient(135deg, #0693e3 0%, #d4a853 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    /* Stats cards */
    .stat-card {
        background: linear-gradient(135deg, rgba(6, 147, 227, 0.1), rgba(212, 168, 83, 0.1));
        border: 1px solid rgba(6, 147, 227, 0.2);
        border-radius: 12px;
        padding: 1rem;
        text-align: center;
        transition: all 0.3s ease;
    }
    .stat-card:hover {
        background: linear-gradient(135deg, rgba(6, 147, 227, 0.18), rgba(212, 168, 83, 0.18));
    }
    /* Theme toggle */
    .theme-toggle {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(6, 147, 227, 0.1);
        border-radius: 8px;
        cursor: pointer;
    }
    /* Navigation enhancement */
    [data-testid="stSidebarNav"] {
        padding-top: 1rem;
    }
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    /* Smooth scrolling */
    html { scroll-behavior: smooth; }
    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        border-radius: 8px;
        padding: 8px 16px;
        font-family: 'Inter', sans-serif;
    }
    /* Larun Engineering brand colors on buttons */
    .stButton > button {
        background: linear-gradient(135deg, #0693e3, #0069e3);
        color: white;
        border: none;
        border-radius: 8px;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
    }
    .stButton > button:hover {
        background: linear-gradient(135deg, #0069e3, #004eb3);
    }
    /* Radio buttons styling */
    .stRadio > div {
        font-family: 'Inter', sans-serif;
    }
</style>
""", unsafe_allow_html=True)

# Apply theme CSS
st.markdown(get_theme_css(st.session_state["theme"]), unsafe_allow_html=True)

# ============== EXPANDED LOCATIONS DATABASE ==============
# 150+ locations worldwide - cities, towns, villages, observatories
LOCATIONS = {
    # ===== INDIA =====
    "mumbai": {"lat": 19.0760, "lon": 72.8777, "name": "Mumbai, India", "country": "India", "type": "city", "population": "20M"},
    "delhi": {"lat": 28.6139, "lon": 77.2090, "name": "Delhi, India", "country": "India", "type": "city", "population": "16M"},
    "bangalore": {"lat": 12.9716, "lon": 77.5946, "name": "Bangalore, India", "country": "India", "type": "city", "population": "8M"},
    "chennai": {"lat": 13.0827, "lon": 80.2707, "name": "Chennai, India", "country": "India", "type": "city", "population": "7M"},
    "kolkata": {"lat": 22.5726, "lon": 88.3639, "name": "Kolkata, India", "country": "India", "type": "city", "population": "5M"},
    "hyderabad": {"lat": 17.3850, "lon": 78.4867, "name": "Hyderabad, India", "country": "India", "type": "city", "population": "7M"},
    "pune": {"lat": 18.5204, "lon": 73.8567, "name": "Pune, India", "country": "India", "type": "city", "population": "3M"},
    "jaipur": {"lat": 26.9124, "lon": 75.7873, "name": "Jaipur, India", "country": "India", "type": "city", "population": "3M"},
    "ladakh": {"lat": 34.1526, "lon": 77.5771, "name": "Ladakh, India", "country": "India", "type": "village", "population": "50K"},
    "hanle": {"lat": 32.7794, "lon": 78.9760, "name": "Hanle Observatory, India", "country": "India", "type": "observatory", "population": "1K"},
    "kodaikanal": {"lat": 10.2381, "lon": 77.4892, "name": "Kodaikanal, India", "country": "India", "type": "town", "population": "36K"},
    "nainital": {"lat": 29.3803, "lon": 79.4636, "name": "Nainital, India", "country": "India", "type": "town", "population": "41K"},
    "udaipur": {"lat": 24.5854, "lon": 73.7125, "name": "Udaipur, India", "country": "India", "type": "city", "population": "500K"},
    "varanasi": {"lat": 25.3176, "lon": 82.9739, "name": "Varanasi, India", "country": "India", "type": "city", "population": "1M"},
    "darjeeling": {"lat": 27.0410, "lon": 88.2663, "name": "Darjeeling, India", "country": "India", "type": "town", "population": "120K"},

    # ===== AFRICA =====
    "nairobi": {"lat": -1.2921, "lon": 36.8219, "name": "Nairobi, Kenya", "country": "Kenya", "type": "city", "population": "4M"},
    "mombasa": {"lat": -4.0435, "lon": 39.6682, "name": "Mombasa, Kenya", "country": "Kenya", "type": "city", "population": "1M"},
    "kisumu": {"lat": -0.1022, "lon": 34.7617, "name": "Kisumu, Kenya", "country": "Kenya", "type": "city", "population": "400K"},
    "lagos": {"lat": 6.5244, "lon": 3.3792, "name": "Lagos, Nigeria", "country": "Nigeria", "type": "city", "population": "15M"},
    "abuja": {"lat": 9.0765, "lon": 7.3986, "name": "Abuja, Nigeria", "country": "Nigeria", "type": "city", "population": "3M"},
    "kano": {"lat": 12.0022, "lon": 8.5920, "name": "Kano, Nigeria", "country": "Nigeria", "type": "city", "population": "4M"},
    "cairo": {"lat": 30.0444, "lon": 31.2357, "name": "Cairo, Egypt", "country": "Egypt", "type": "city", "population": "10M"},
    "alexandria": {"lat": 31.2001, "lon": 29.9187, "name": "Alexandria, Egypt", "country": "Egypt", "type": "city", "population": "5M"},
    "johannesburg": {"lat": -26.2041, "lon": 28.0473, "name": "Johannesburg, South Africa", "country": "South Africa", "type": "city", "population": "5M"},
    "cape_town": {"lat": -33.9249, "lon": 18.4241, "name": "Cape Town, South Africa", "country": "South Africa", "type": "city", "population": "4M"},
    "durban": {"lat": -29.8587, "lon": 31.0218, "name": "Durban, South Africa", "country": "South Africa", "type": "city", "population": "3M"},
    "sutherland": {"lat": -32.3792, "lon": 20.8108, "name": "Sutherland Observatory, South Africa", "country": "South Africa", "type": "observatory", "population": "3K"},
    "addis_ababa": {"lat": 8.9806, "lon": 38.7578, "name": "Addis Ababa, Ethiopia", "country": "Ethiopia", "type": "city", "population": "4M"},
    "dar_es_salaam": {"lat": -6.7924, "lon": 39.2083, "name": "Dar es Salaam, Tanzania", "country": "Tanzania", "type": "city", "population": "5M"},
    "kampala": {"lat": 0.3476, "lon": 32.5825, "name": "Kampala, Uganda", "country": "Uganda", "type": "city", "population": "2M"},
    "accra": {"lat": 5.6037, "lon": -0.1870, "name": "Accra, Ghana", "country": "Ghana", "type": "city", "population": "2M"},
    "casablanca": {"lat": 33.5731, "lon": -7.5898, "name": "Casablanca, Morocco", "country": "Morocco", "type": "city", "population": "4M"},
    "marrakech": {"lat": 31.6295, "lon": -7.9811, "name": "Marrakech, Morocco", "country": "Morocco", "type": "city", "population": "1M"},
    "tunis": {"lat": 36.8065, "lon": 10.1815, "name": "Tunis, Tunisia", "country": "Tunisia", "type": "city", "population": "2M"},
    "kigali": {"lat": -1.9403, "lon": 29.8739, "name": "Kigali, Rwanda", "country": "Rwanda", "type": "city", "population": "1M"},

    # ===== ASIA =====
    "tokyo": {"lat": 35.6762, "lon": 139.6503, "name": "Tokyo, Japan", "country": "Japan", "type": "city", "population": "14M"},
    "osaka": {"lat": 34.6937, "lon": 135.5023, "name": "Osaka, Japan", "country": "Japan", "type": "city", "population": "3M"},
    "kyoto": {"lat": 35.0116, "lon": 135.7681, "name": "Kyoto, Japan", "country": "Japan", "type": "city", "population": "1M"},
    "beijing": {"lat": 39.9042, "lon": 116.4074, "name": "Beijing, China", "country": "China", "type": "city", "population": "21M"},
    "shanghai": {"lat": 31.2304, "lon": 121.4737, "name": "Shanghai, China", "country": "China", "type": "city", "population": "24M"},
    "hong_kong": {"lat": 22.3193, "lon": 114.1694, "name": "Hong Kong", "country": "China", "type": "city", "population": "7M"},
    "xinglong": {"lat": 40.3958, "lon": 117.5775, "name": "Xinglong Observatory, China", "country": "China", "type": "observatory", "population": "1K"},
    "singapore": {"lat": 1.3521, "lon": 103.8198, "name": "Singapore", "country": "Singapore", "type": "city", "population": "6M"},
    "bangkok": {"lat": 13.7563, "lon": 100.5018, "name": "Bangkok, Thailand", "country": "Thailand", "type": "city", "population": "8M"},
    "chiang_mai": {"lat": 18.7883, "lon": 98.9853, "name": "Chiang Mai, Thailand", "country": "Thailand", "type": "city", "population": "1M"},
    "hanoi": {"lat": 21.0285, "lon": 105.8542, "name": "Hanoi, Vietnam", "country": "Vietnam", "type": "city", "population": "8M"},
    "ho_chi_minh": {"lat": 10.8231, "lon": 106.6297, "name": "Ho Chi Minh City, Vietnam", "country": "Vietnam", "type": "city", "population": "9M"},
    "jakarta": {"lat": -6.2088, "lon": 106.8456, "name": "Jakarta, Indonesia", "country": "Indonesia", "type": "city", "population": "10M"},
    "bali": {"lat": -8.4095, "lon": 115.1889, "name": "Bali, Indonesia", "country": "Indonesia", "type": "island", "population": "4M"},
    "manila": {"lat": 14.5995, "lon": 120.9842, "name": "Manila, Philippines", "country": "Philippines", "type": "city", "population": "2M"},
    "seoul": {"lat": 37.5665, "lon": 126.9780, "name": "Seoul, South Korea", "country": "South Korea", "type": "city", "population": "10M"},
    "dubai": {"lat": 25.2048, "lon": 55.2708, "name": "Dubai, UAE", "country": "UAE", "type": "city", "population": "3M"},
    "abu_dhabi": {"lat": 24.4539, "lon": 54.3773, "name": "Abu Dhabi, UAE", "country": "UAE", "type": "city", "population": "1M"},
    "tehran": {"lat": 35.6892, "lon": 51.3890, "name": "Tehran, Iran", "country": "Iran", "type": "city", "population": "9M"},
    "karachi": {"lat": 24.8607, "lon": 67.0011, "name": "Karachi, Pakistan", "country": "Pakistan", "type": "city", "population": "15M"},
    "lahore": {"lat": 31.5204, "lon": 74.3587, "name": "Lahore, Pakistan", "country": "Pakistan", "type": "city", "population": "11M"},
    "dhaka": {"lat": 23.8103, "lon": 90.4125, "name": "Dhaka, Bangladesh", "country": "Bangladesh", "type": "city", "population": "21M"},
    "kathmandu": {"lat": 27.7172, "lon": 85.3240, "name": "Kathmandu, Nepal", "country": "Nepal", "type": "city", "population": "1M"},
    "colombo": {"lat": 6.9271, "lon": 79.8612, "name": "Colombo, Sri Lanka", "country": "Sri Lanka", "type": "city", "population": "800K"},
    "ulaanbaatar": {"lat": 47.8864, "lon": 106.9057, "name": "Ulaanbaatar, Mongolia", "country": "Mongolia", "type": "city", "population": "1M"},

    # ===== EUROPE =====
    "london": {"lat": 51.5074, "lon": -0.1278, "name": "London, UK", "country": "UK", "type": "city", "population": "9M"},
    "manchester": {"lat": 53.4808, "lon": -2.2426, "name": "Manchester, UK", "country": "UK", "type": "city", "population": "2M"},
    "edinburgh": {"lat": 55.9533, "lon": -3.1883, "name": "Edinburgh, UK", "country": "UK", "type": "city", "population": "500K"},
    "paris": {"lat": 48.8566, "lon": 2.3522, "name": "Paris, France", "country": "France", "type": "city", "population": "2M"},
    "marseille": {"lat": 43.2965, "lon": 5.3698, "name": "Marseille, France", "country": "France", "type": "city", "population": "900K"},
    "berlin": {"lat": 52.5200, "lon": 13.4050, "name": "Berlin, Germany", "country": "Germany", "type": "city", "population": "4M"},
    "munich": {"lat": 48.1351, "lon": 11.5820, "name": "Munich, Germany", "country": "Germany", "type": "city", "population": "1M"},
    "rome": {"lat": 41.9028, "lon": 12.4964, "name": "Rome, Italy", "country": "Italy", "type": "city", "population": "3M"},
    "milan": {"lat": 45.4642, "lon": 9.1900, "name": "Milan, Italy", "country": "Italy", "type": "city", "population": "1M"},
    "madrid": {"lat": 40.4168, "lon": -3.7038, "name": "Madrid, Spain", "country": "Spain", "type": "city", "population": "3M"},
    "barcelona": {"lat": 41.3851, "lon": 2.1734, "name": "Barcelona, Spain", "country": "Spain", "type": "city", "population": "2M"},
    "amsterdam": {"lat": 52.3676, "lon": 4.9041, "name": "Amsterdam, Netherlands", "country": "Netherlands", "type": "city", "population": "900K"},
    "vienna": {"lat": 48.2082, "lon": 16.3738, "name": "Vienna, Austria", "country": "Austria", "type": "city", "population": "2M"},
    "zurich": {"lat": 47.3769, "lon": 8.5417, "name": "Zurich, Switzerland", "country": "Switzerland", "type": "city", "population": "400K"},
    "moscow": {"lat": 55.7558, "lon": 37.6173, "name": "Moscow, Russia", "country": "Russia", "type": "city", "population": "12M"},
    "st_petersburg": {"lat": 59.9343, "lon": 30.3351, "name": "St. Petersburg, Russia", "country": "Russia", "type": "city", "population": "5M"},
    "stockholm": {"lat": 59.3293, "lon": 18.0686, "name": "Stockholm, Sweden", "country": "Sweden", "type": "city", "population": "1M"},
    "oslo": {"lat": 59.9139, "lon": 10.7522, "name": "Oslo, Norway", "country": "Norway", "type": "city", "population": "700K"},
    "copenhagen": {"lat": 55.6761, "lon": 12.5683, "name": "Copenhagen, Denmark", "country": "Denmark", "type": "city", "population": "600K"},
    "helsinki": {"lat": 60.1699, "lon": 24.9384, "name": "Helsinki, Finland", "country": "Finland", "type": "city", "population": "600K"},
    "athens": {"lat": 37.9838, "lon": 23.7275, "name": "Athens, Greece", "country": "Greece", "type": "city", "population": "700K"},
    "istanbul": {"lat": 41.0082, "lon": 28.9784, "name": "Istanbul, Turkey", "country": "Turkey", "type": "city", "population": "15M"},
    "prague": {"lat": 50.0755, "lon": 14.4378, "name": "Prague, Czech Republic", "country": "Czech Republic", "type": "city", "population": "1M"},
    "warsaw": {"lat": 52.2297, "lon": 21.0122, "name": "Warsaw, Poland", "country": "Poland", "type": "city", "population": "2M"},
    "budapest": {"lat": 47.4979, "lon": 19.0402, "name": "Budapest, Hungary", "country": "Hungary", "type": "city", "population": "2M"},
    "lisbon": {"lat": 38.7223, "lon": -9.1393, "name": "Lisbon, Portugal", "country": "Portugal", "type": "city", "population": "500K"},
    "dublin": {"lat": 53.3498, "lon": -6.2603, "name": "Dublin, Ireland", "country": "Ireland", "type": "city", "population": "500K"},
    "reykjavik": {"lat": 64.1466, "lon": -21.9426, "name": "Reykjavik, Iceland", "country": "Iceland", "type": "city", "population": "130K"},
    "tromso": {"lat": 69.6492, "lon": 18.9553, "name": "Tromsø, Norway", "country": "Norway", "type": "city", "population": "77K"},

    # ===== AMERICAS =====
    "new_york": {"lat": 40.7128, "lon": -74.0060, "name": "New York, USA", "country": "USA", "type": "city", "population": "8M"},
    "los_angeles": {"lat": 34.0522, "lon": -118.2437, "name": "Los Angeles, USA", "country": "USA", "type": "city", "population": "4M"},
    "chicago": {"lat": 41.8781, "lon": -87.6298, "name": "Chicago, USA", "country": "USA", "type": "city", "population": "3M"},
    "houston": {"lat": 29.7604, "lon": -95.3698, "name": "Houston, USA", "country": "USA", "type": "city", "population": "2M"},
    "phoenix": {"lat": 33.4484, "lon": -112.0740, "name": "Phoenix, USA", "country": "USA", "type": "city", "population": "2M"},
    "san_francisco": {"lat": 37.7749, "lon": -122.4194, "name": "San Francisco, USA", "country": "USA", "type": "city", "population": "900K"},
    "seattle": {"lat": 47.6062, "lon": -122.3321, "name": "Seattle, USA", "country": "USA", "type": "city", "population": "700K"},
    "denver": {"lat": 39.7392, "lon": -104.9903, "name": "Denver, USA", "country": "USA", "type": "city", "population": "700K"},
    "austin": {"lat": 30.2672, "lon": -97.7431, "name": "Austin, USA", "country": "USA", "type": "city", "population": "1M"},
    "miami": {"lat": 25.7617, "lon": -80.1918, "name": "Miami, USA", "country": "USA", "type": "city", "population": "500K"},
    "boston": {"lat": 42.3601, "lon": -71.0589, "name": "Boston, USA", "country": "USA", "type": "city", "population": "700K"},
    "toronto": {"lat": 43.6532, "lon": -79.3832, "name": "Toronto, Canada", "country": "Canada", "type": "city", "population": "3M"},
    "vancouver": {"lat": 49.2827, "lon": -123.1207, "name": "Vancouver, Canada", "country": "Canada", "type": "city", "population": "700K"},
    "montreal": {"lat": 45.5017, "lon": -73.5673, "name": "Montreal, Canada", "country": "Canada", "type": "city", "population": "2M"},
    "mexico_city": {"lat": 19.4326, "lon": -99.1332, "name": "Mexico City, Mexico", "country": "Mexico", "type": "city", "population": "9M"},
    "guadalajara": {"lat": 20.6597, "lon": -103.3496, "name": "Guadalajara, Mexico", "country": "Mexico", "type": "city", "population": "2M"},
    "cancun": {"lat": 21.1619, "lon": -86.8515, "name": "Cancun, Mexico", "country": "Mexico", "type": "city", "population": "900K"},
    "sao_paulo": {"lat": -23.5505, "lon": -46.6333, "name": "São Paulo, Brazil", "country": "Brazil", "type": "city", "population": "12M"},
    "rio_de_janeiro": {"lat": -22.9068, "lon": -43.1729, "name": "Rio de Janeiro, Brazil", "country": "Brazil", "type": "city", "population": "7M"},
    "brasilia": {"lat": -15.8267, "lon": -47.9218, "name": "Brasília, Brazil", "country": "Brazil", "type": "city", "population": "3M"},
    "buenos_aires": {"lat": -34.6037, "lon": -58.3816, "name": "Buenos Aires, Argentina", "country": "Argentina", "type": "city", "population": "3M"},
    "santiago": {"lat": -33.4489, "lon": -70.6693, "name": "Santiago, Chile", "country": "Chile", "type": "city", "population": "6M"},
    "lima": {"lat": -12.0464, "lon": -77.0428, "name": "Lima, Peru", "country": "Peru", "type": "city", "population": "10M"},
    "bogota": {"lat": 4.7110, "lon": -74.0721, "name": "Bogotá, Colombia", "country": "Colombia", "type": "city", "population": "8M"},
    "medellin": {"lat": 6.2442, "lon": -75.5812, "name": "Medellín, Colombia", "country": "Colombia", "type": "city", "population": "2M"},
    "havana": {"lat": 23.1136, "lon": -82.3666, "name": "Havana, Cuba", "country": "Cuba", "type": "city", "population": "2M"},
    "kingston": {"lat": 17.9714, "lon": -76.7920, "name": "Kingston, Jamaica", "country": "Jamaica", "type": "city", "population": "600K"},
    "quito": {"lat": -0.1807, "lon": -78.4678, "name": "Quito, Ecuador", "country": "Ecuador", "type": "city", "population": "2M"},

    # ===== OCEANIA =====
    "sydney": {"lat": -33.8688, "lon": 151.2093, "name": "Sydney, Australia", "country": "Australia", "type": "city", "population": "5M"},
    "melbourne": {"lat": -37.8136, "lon": 144.9631, "name": "Melbourne, Australia", "country": "Australia", "type": "city", "population": "5M"},
    "brisbane": {"lat": -27.4698, "lon": 153.0251, "name": "Brisbane, Australia", "country": "Australia", "type": "city", "population": "2M"},
    "perth": {"lat": -31.9505, "lon": 115.8605, "name": "Perth, Australia", "country": "Australia", "type": "city", "population": "2M"},
    "adelaide": {"lat": -34.9285, "lon": 138.6007, "name": "Adelaide, Australia", "country": "Australia", "type": "city", "population": "1M"},
    "auckland": {"lat": -36.8485, "lon": 174.7633, "name": "Auckland, New Zealand", "country": "New Zealand", "type": "city", "population": "1M"},
    "wellington": {"lat": -41.2865, "lon": 174.7762, "name": "Wellington, New Zealand", "country": "New Zealand", "type": "city", "population": "200K"},
    "queenstown": {"lat": -45.0312, "lon": 168.6626, "name": "Queenstown, New Zealand", "country": "New Zealand", "type": "town", "population": "15K"},
    "fiji": {"lat": -17.7134, "lon": 178.0650, "name": "Suva, Fiji", "country": "Fiji", "type": "city", "population": "90K"},
    "tahiti": {"lat": -17.6509, "lon": -149.4260, "name": "Papeete, Tahiti", "country": "French Polynesia", "type": "city", "population": "26K"},

    # ===== FAMOUS OBSERVATORIES =====
    "mauna_kea": {"lat": 19.8208, "lon": -155.4680, "name": "Mauna Kea, Hawaii", "country": "USA", "type": "observatory", "population": "0"},
    "atacama": {"lat": -24.6275, "lon": -70.4044, "name": "Atacama Desert, Chile", "country": "Chile", "type": "observatory", "population": "0"},
    "paranal": {"lat": -24.6272, "lon": -70.4042, "name": "Paranal Observatory, Chile", "country": "Chile", "type": "observatory", "population": "0"},
    "la_palma": {"lat": 28.7606, "lon": -17.8925, "name": "La Palma, Canary Islands", "country": "Spain", "type": "observatory", "population": "85K"},
    "arecibo": {"lat": 18.3464, "lon": -66.7528, "name": "Arecibo, Puerto Rico", "country": "USA", "type": "observatory", "population": "50K"},
    "greenbank": {"lat": 38.4330, "lon": -79.8397, "name": "Green Bank, West Virginia", "country": "USA", "type": "observatory", "population": "200"},
    "alma": {"lat": -23.0234, "lon": -67.7538, "name": "ALMA, Chile", "country": "Chile", "type": "observatory", "population": "0"},

    # ===== REMOTE & UNIQUE LOCATIONS =====
    "svalbard": {"lat": 78.2232, "lon": 15.6267, "name": "Svalbard, Norway", "country": "Norway", "type": "arctic", "population": "3K"},
    "mcmurdo": {"lat": -77.8419, "lon": 166.6863, "name": "McMurdo Station, Antarctica", "country": "Antarctica", "type": "research", "population": "1K"},
    "easter_island": {"lat": -27.1127, "lon": -109.3497, "name": "Easter Island, Chile", "country": "Chile", "type": "island", "population": "8K"},
    "galapagos": {"lat": -0.9538, "lon": -90.9656, "name": "Galápagos Islands, Ecuador", "country": "Ecuador", "type": "island", "population": "25K"},
    "madagascar": {"lat": -18.8792, "lon": 47.5079, "name": "Antananarivo, Madagascar", "country": "Madagascar", "type": "city", "population": "1M"},
    "maldives": {"lat": 4.1755, "lon": 73.5093, "name": "Malé, Maldives", "country": "Maldives", "type": "island", "population": "200K"},
    "bhutan": {"lat": 27.5142, "lon": 90.4336, "name": "Thimphu, Bhutan", "country": "Bhutan", "type": "city", "population": "100K"},
    "patagonia": {"lat": -51.6230, "lon": -69.2168, "name": "Río Gallegos, Patagonia", "country": "Argentina", "type": "town", "population": "100K"},
}

# Get unique countries for filtering
COUNTRIES = sorted(list(set([loc["country"] for loc in LOCATIONS.values()])))
LOCATION_TYPES = ["All", "city", "town", "village", "observatory", "island", "arctic", "research"]

# ============== REST OF DATA ==============
STARS_WITH_AGES = [
    {"name": "Proxima Centauri", "distance_ly": 4.24, "age_myr": 4850, "constellation": "Centaurus"},
    {"name": "Sirius", "distance_ly": 8.6, "age_myr": 242, "constellation": "Canis Major"},
    {"name": "Tau Ceti", "distance_ly": 12, "age_myr": 5800, "constellation": "Cetus"},
    {"name": "Epsilon Eridani", "distance_ly": 10.5, "age_myr": 800, "constellation": "Eridanus"},
    {"name": "Altair", "distance_ly": 17, "age_myr": 1200, "constellation": "Aquila"},
    {"name": "Vega", "distance_ly": 25, "age_myr": 455, "constellation": "Lyra"},
    {"name": "Arcturus", "distance_ly": 37, "age_myr": 7100, "constellation": "Boötes"},
    {"name": "Pollux", "distance_ly": 34, "age_myr": 724, "constellation": "Gemini"},
    {"name": "Aldebaran", "distance_ly": 65, "age_myr": 6500, "constellation": "Taurus"},
    {"name": "Betelgeuse", "distance_ly": 700, "age_myr": 10, "constellation": "Orion"},
]

HISTORICAL_EVENTS = {
    "Moon Landing": {"date": date(1969, 7, 20), "desc": "Apollo 11 lands on the Moon"},
    "First Human in Space": {"date": date(1961, 4, 12), "desc": "Yuri Gagarin orbits Earth"},
    "Hubble Launch": {"date": date(1990, 4, 24), "desc": "Hubble Space Telescope deployed"},
    "First Exoplanet": {"date": date(1995, 10, 6), "desc": "51 Pegasi b discovered"},
    "JWST Launch": {"date": date(2021, 12, 25), "desc": "James Webb Space Telescope launched"},
}

DEEP_SKY_OBJECTS = {
    "M31": {"ra": 10.6847, "dec": 41.2689, "name": "Andromeda Galaxy", "type": "Galaxy", "distance_ly": 2537000},
    "M42": {"ra": 83.8208, "dec": -5.3911, "name": "Orion Nebula", "type": "Nebula", "distance_ly": 1344},
    "M45": {"ra": 56.75, "dec": 24.12, "name": "Pleiades", "type": "Cluster", "distance_ly": 444},
    "LMC": {"ra": 80.8942, "dec": -69.7561, "name": "Large Magellanic Cloud", "type": "Galaxy", "distance_ly": 158200},
    "SMC": {"ra": 13.1583, "dec": -72.8003, "name": "Small Magellanic Cloud", "type": "Galaxy", "distance_ly": 199000},
    "Eta Carinae": {"ra": 161.2648, "dec": -59.6847, "name": "Eta Carinae Nebula", "type": "Nebula", "distance_ly": 7500},
    "Omega Centauri": {"ra": 201.6970, "dec": -47.4795, "name": "Omega Centauri", "type": "Cluster", "distance_ly": 15800},
    "Southern Cross": {"ra": 186.6496, "dec": -63.0990, "name": "Crux (Southern Cross)", "type": "Constellation", "distance_ly": 350},
}

EXOPLANETS = [
    {"name": "Proxima b", "star": "Proxima Centauri", "distance_ly": 4.24, "habitable": True, "year": 2016},
    {"name": "TRAPPIST-1e", "star": "TRAPPIST-1", "distance_ly": 39, "habitable": True, "year": 2017},
    {"name": "Kepler-442b", "star": "Kepler-442", "distance_ly": 112, "habitable": True, "year": 2015},
    {"name": "K2-18b", "star": "K2-18", "distance_ly": 124, "habitable": True, "year": 2015},
    {"name": "TOI-700d", "star": "TOI-700", "distance_ly": 101, "habitable": True, "year": 2020},
    {"name": "Kepler-452b", "star": "Kepler-452", "distance_ly": 1400, "habitable": True, "year": 2015},
]

# ============== ASTROLOGICAL DATA ==============

# Zodiac signs (Western/Tropical)
ZODIAC_SIGNS = [
    {"name": "Aries", "symbol": "♈", "start_deg": 0, "element": "Fire", "quality": "Cardinal", "ruler": "Mars"},
    {"name": "Taurus", "symbol": "♉", "start_deg": 30, "element": "Earth", "quality": "Fixed", "ruler": "Venus"},
    {"name": "Gemini", "symbol": "♊", "start_deg": 60, "element": "Air", "quality": "Mutable", "ruler": "Mercury"},
    {"name": "Cancer", "symbol": "♋", "start_deg": 90, "element": "Water", "quality": "Cardinal", "ruler": "Moon"},
    {"name": "Leo", "symbol": "♌", "start_deg": 120, "element": "Fire", "quality": "Fixed", "ruler": "Sun"},
    {"name": "Virgo", "symbol": "♍", "start_deg": 150, "element": "Earth", "quality": "Mutable", "ruler": "Mercury"},
    {"name": "Libra", "symbol": "♎", "start_deg": 180, "element": "Air", "quality": "Cardinal", "ruler": "Venus"},
    {"name": "Scorpio", "symbol": "♏", "start_deg": 210, "element": "Water", "quality": "Fixed", "ruler": "Mars/Pluto"},
    {"name": "Sagittarius", "symbol": "♐", "start_deg": 240, "element": "Fire", "quality": "Mutable", "ruler": "Jupiter"},
    {"name": "Capricorn", "symbol": "♑", "start_deg": 270, "element": "Earth", "quality": "Cardinal", "ruler": "Saturn"},
    {"name": "Aquarius", "symbol": "♒", "start_deg": 300, "element": "Air", "quality": "Fixed", "ruler": "Saturn/Uranus"},
    {"name": "Pisces", "symbol": "♓", "start_deg": 330, "element": "Water", "quality": "Mutable", "ruler": "Jupiter/Neptune"},
]

# Vedic Rashis (Sidereal zodiac - Lahiri Ayanamsa ~24°)
RASHIS = [
    {"name": "Mesha", "english": "Aries", "symbol": "♈", "lord": "Mangal (Mars)"},
    {"name": "Vrishabha", "english": "Taurus", "symbol": "♉", "lord": "Shukra (Venus)"},
    {"name": "Mithuna", "english": "Gemini", "symbol": "♊", "lord": "Budha (Mercury)"},
    {"name": "Karka", "english": "Cancer", "symbol": "♋", "lord": "Chandra (Moon)"},
    {"name": "Simha", "english": "Leo", "symbol": "♌", "lord": "Surya (Sun)"},
    {"name": "Kanya", "english": "Virgo", "symbol": "♍", "lord": "Budha (Mercury)"},
    {"name": "Tula", "english": "Libra", "symbol": "♎", "lord": "Shukra (Venus)"},
    {"name": "Vrishchika", "english": "Scorpio", "symbol": "♏", "lord": "Mangal (Mars)"},
    {"name": "Dhanu", "english": "Sagittarius", "symbol": "♐", "lord": "Guru (Jupiter)"},
    {"name": "Makara", "english": "Capricorn", "symbol": "♑", "lord": "Shani (Saturn)"},
    {"name": "Kumbha", "english": "Aquarius", "symbol": "♒", "lord": "Shani (Saturn)"},
    {"name": "Meena", "english": "Pisces", "symbol": "♓", "lord": "Guru (Jupiter)"},
]

# 27 Nakshatras (Lunar Mansions)
NAKSHATRAS = [
    {"name": "Ashwini", "lord": "Ketu", "deity": "Ashwini Kumaras", "start_deg": 0},
    {"name": "Bharani", "lord": "Venus", "deity": "Yama", "start_deg": 13.333},
    {"name": "Krittika", "lord": "Sun", "deity": "Agni", "start_deg": 26.667},
    {"name": "Rohini", "lord": "Moon", "deity": "Brahma", "start_deg": 40},
    {"name": "Mrigashira", "lord": "Mars", "deity": "Soma", "start_deg": 53.333},
    {"name": "Ardra", "lord": "Rahu", "deity": "Rudra", "start_deg": 66.667},
    {"name": "Punarvasu", "lord": "Jupiter", "deity": "Aditi", "start_deg": 80},
    {"name": "Pushya", "lord": "Saturn", "deity": "Brihaspati", "start_deg": 93.333},
    {"name": "Ashlesha", "lord": "Mercury", "deity": "Nagas", "start_deg": 106.667},
    {"name": "Magha", "lord": "Ketu", "deity": "Pitris", "start_deg": 120},
    {"name": "Purva Phalguni", "lord": "Venus", "deity": "Bhaga", "start_deg": 133.333},
    {"name": "Uttara Phalguni", "lord": "Sun", "deity": "Aryaman", "start_deg": 146.667},
    {"name": "Hasta", "lord": "Moon", "deity": "Savitar", "start_deg": 160},
    {"name": "Chitra", "lord": "Mars", "deity": "Vishwakarma", "start_deg": 173.333},
    {"name": "Swati", "lord": "Rahu", "deity": "Vayu", "start_deg": 186.667},
    {"name": "Vishakha", "lord": "Jupiter", "deity": "Indra-Agni", "start_deg": 200},
    {"name": "Anuradha", "lord": "Saturn", "deity": "Mitra", "start_deg": 213.333},
    {"name": "Jyeshtha", "lord": "Mercury", "deity": "Indra", "start_deg": 226.667},
    {"name": "Mula", "lord": "Ketu", "deity": "Nirriti", "start_deg": 240},
    {"name": "Purva Ashadha", "lord": "Venus", "deity": "Apas", "start_deg": 253.333},
    {"name": "Uttara Ashadha", "lord": "Sun", "deity": "Vishwadevas", "start_deg": 266.667},
    {"name": "Shravana", "lord": "Moon", "deity": "Vishnu", "start_deg": 280},
    {"name": "Dhanishta", "lord": "Mars", "deity": "Vasus", "start_deg": 293.333},
    {"name": "Shatabhisha", "lord": "Rahu", "deity": "Varuna", "start_deg": 306.667},
    {"name": "Purva Bhadrapada", "lord": "Jupiter", "deity": "Aja Ekapada", "start_deg": 320},
    {"name": "Uttara Bhadrapada", "lord": "Saturn", "deity": "Ahir Budhnya", "start_deg": 333.333},
    {"name": "Revati", "lord": "Mercury", "deity": "Pushan", "start_deg": 346.667},
]

# Planet symbols and data
PLANETS = {
    "Sun": {"symbol": "☉", "vedic": "Surya", "color": "#FFD700"},
    "Moon": {"symbol": "☽", "vedic": "Chandra", "color": "#C0C0C0"},
    "Mercury": {"symbol": "☿", "vedic": "Budha", "color": "#7FFF00"},
    "Venus": {"symbol": "♀", "vedic": "Shukra", "color": "#FF69B4"},
    "Mars": {"symbol": "♂", "vedic": "Mangal", "color": "#FF4500"},
    "Jupiter": {"symbol": "♃", "vedic": "Guru", "color": "#FFD700"},
    "Saturn": {"symbol": "♄", "vedic": "Shani", "color": "#4169E1"},
    "Rahu": {"symbol": "☊", "vedic": "Rahu", "color": "#2F4F4F"},
    "Ketu": {"symbol": "☋", "vedic": "Ketu", "color": "#8B4513"},
}

# Moon phases
MOON_PHASES = [
    {"name": "New Moon", "emoji": "🌑", "tithi": "Amavasya"},
    {"name": "Waxing Crescent", "emoji": "🌒", "tithi": "Shukla 2-6"},
    {"name": "First Quarter", "emoji": "🌓", "tithi": "Shukla 7-8"},
    {"name": "Waxing Gibbous", "emoji": "🌔", "tithi": "Shukla 9-14"},
    {"name": "Full Moon", "emoji": "🌕", "tithi": "Purnima"},
    {"name": "Waning Gibbous", "emoji": "🌖", "tithi": "Krishna 2-6"},
    {"name": "Last Quarter", "emoji": "🌗", "tithi": "Krishna 7-8"},
    {"name": "Waning Crescent", "emoji": "🌘", "tithi": "Krishna 9-14"},
]

# Planetary hours order (Chaldean)
PLANETARY_HOURS_ORDER = ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"]
WEEKDAY_RULERS = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]  # Mon-Sun

# Retrograde periods for 2024-2026 (approximate)
RETROGRADE_PERIODS = {
    "Mercury": [
        {"start": date(2024, 4, 1), "end": date(2024, 4, 25), "sign": "Aries"},
        {"start": date(2024, 8, 5), "end": date(2024, 8, 28), "sign": "Virgo/Leo"},
        {"start": date(2024, 11, 26), "end": date(2024, 12, 15), "sign": "Sagittarius"},
        {"start": date(2025, 3, 15), "end": date(2025, 4, 7), "sign": "Aries/Pisces"},
        {"start": date(2025, 7, 18), "end": date(2025, 8, 11), "sign": "Leo"},
        {"start": date(2025, 11, 9), "end": date(2025, 11, 29), "sign": "Sagittarius"},
        {"start": date(2026, 2, 26), "end": date(2026, 3, 20), "sign": "Pisces"},
        {"start": date(2026, 6, 29), "end": date(2026, 7, 23), "sign": "Cancer"},
    ],
    "Venus": [
        {"start": date(2025, 3, 2), "end": date(2025, 4, 13), "sign": "Aries/Pisces"},
        {"start": date(2026, 10, 3), "end": date(2026, 11, 14), "sign": "Scorpio"},
    ],
    "Mars": [
        {"start": date(2024, 12, 6), "end": date(2025, 2, 24), "sign": "Leo/Cancer"},
        {"start": date(2027, 1, 10), "end": date(2027, 4, 1), "sign": "Virgo/Leo"},
    ],
    "Jupiter": [
        {"start": date(2024, 10, 9), "end": date(2025, 2, 4), "sign": "Gemini"},
        {"start": date(2025, 11, 11), "end": date(2026, 3, 11), "sign": "Cancer"},
    ],
    "Saturn": [
        {"start": date(2024, 6, 29), "end": date(2024, 11, 15), "sign": "Pisces"},
        {"start": date(2025, 7, 13), "end": date(2025, 11, 28), "sign": "Pisces/Aries"},
    ],
}

# Cosmic facts for personalization
BIRTH_NUMBER_MEANINGS = {
    1: {"planet": "Sun", "traits": "Leadership, independence, originality", "color": "Gold", "day": "Sunday"},
    2: {"planet": "Moon", "traits": "Intuition, sensitivity, diplomacy", "color": "Silver/White", "day": "Monday"},
    3: {"planet": "Jupiter", "traits": "Creativity, expression, optimism", "color": "Yellow", "day": "Thursday"},
    4: {"planet": "Rahu/Uranus", "traits": "Stability, hard work, unconventional", "color": "Blue", "day": "Sunday"},
    5: {"planet": "Mercury", "traits": "Adventure, versatility, communication", "color": "Green", "day": "Wednesday"},
    6: {"planet": "Venus", "traits": "Harmony, love, responsibility", "color": "Pink", "day": "Friday"},
    7: {"planet": "Ketu/Neptune", "traits": "Spirituality, introspection, wisdom", "color": "Violet", "day": "Monday"},
    8: {"planet": "Saturn", "traits": "Ambition, discipline, karma", "color": "Black/Dark Blue", "day": "Saturday"},
    9: {"planet": "Mars", "traits": "Courage, energy, completion", "color": "Red", "day": "Tuesday"},
}

# Star stories and mythology
STAR_MYTHOLOGY = {
    "Polaris": {
        "cultures": ["Greek", "Chinese", "Hindu", "Norse"],
        "greek": "Associated with the nymph Cynosura who nursed Zeus",
        "hindu": "Dhruva Tara - the star of the devoted prince Dhruva",
        "chinese": "Bei Ji - the Emperor of Heaven's throne",
        "fact": "Polaris hasn't always been the North Star; Earth's axial precession changes it over 26,000 years"
    },
    "Sirius": {
        "cultures": ["Egyptian", "Greek", "Polynesian", "Dogon"],
        "egyptian": "Sopdet - goddess of the Nile flood, linked to Isis",
        "greek": "The 'Dog Star' in Canis Major, causing the 'dog days' of summer",
        "fact": "Sirius is actually a binary star system; Sirius B is a white dwarf"
    },
    "Pleiades": {
        "cultures": ["Greek", "Japanese", "Māori", "Cherokee", "Hindu"],
        "greek": "Seven daughters of Atlas, placed in sky by Zeus",
        "hindu": "Krittika - the celestial nurses who raised Kartikeya",
        "japanese": "Subaru - the constellation that inspired the car company logo",
        "fact": "Over 1,000 stars in this cluster, only 6-7 visible to naked eye"
    },
    "Orion": {
        "cultures": ["Greek", "Egyptian", "Babylonian", "Hindu"],
        "greek": "The great hunter, placed in sky after being killed by Artemis",
        "hindu": "Mriga (deer) chased by Prajapati (Ardra star)",
        "egyptian": "Sah - associated with Osiris, god of the afterlife",
        "fact": "Betelgeuse in Orion may explode as a supernova within 100,000 years"
    },
    "Vega": {
        "cultures": ["Chinese", "Japanese", "Arabic", "Hindu"],
        "chinese": "Zhi Nu - the Weaver Girl in the love story with Cowherd (Altair)",
        "arabic": "Al-Nasr al-Waqi - the falling eagle",
        "fact": "Vega was the North Star about 12,000 years ago and will be again in 13,000 years"
    },
}

# Name numerology letters
NUMEROLOGY_VALUES = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
    'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
}

# Interesting cosmic facts
COSMIC_FACTS = [
    "If you could travel at the speed of light, time would stop for you completely.",
    "A day on Venus is longer than a year on Venus.",
    "The Sun makes up 99.86% of all the mass in our solar system.",
    "Neutron stars are so dense that a teaspoon would weigh about 6 billion tons.",
    "The largest known star, UY Scuti, could fit 5 billion Suns inside it.",
    "There are more stars in the universe than grains of sand on all Earth's beaches.",
    "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
    "The Moon is slowly moving away from Earth at about 3.8 cm per year.",
    "A year on Mercury is just 88 Earth days.",
    "The footprints left on the Moon by astronauts will stay for millions of years.",
    "Space is completely silent because there's no atmosphere for sound to travel.",
    "One million Earths could fit inside the Sun.",
    "The largest volcano in the solar system is Olympus Mons on Mars.",
    "Saturn would float if you could find a bathtub big enough.",
    "The Milky Way and Andromeda galaxies will collide in about 4.5 billion years.",
]


def calculate_life_path_number(birth_date):
    """Calculate Life Path Number from birth date"""
    total = sum(int(d) for d in birth_date.strftime("%Y%m%d"))
    while total > 9 and total not in [11, 22, 33]:
        total = sum(int(d) for d in str(total))
    return total


def calculate_name_number(name):
    """Calculate Name Number from name"""
    total = sum(NUMEROLOGY_VALUES.get(c.upper(), 0) for c in name if c.isalpha())
    while total > 9:
        total = sum(int(d) for d in str(total))
    return total


def get_current_retrograde_planets(check_date=None):
    """Get list of planets currently in retrograde"""
    if check_date is None:
        check_date = date.today()

    retrograde_now = []
    for planet, periods in RETROGRADE_PERIODS.items():
        for period in periods:
            if period["start"] <= check_date <= period["end"]:
                retrograde_now.append({
                    "planet": planet,
                    "sign": period["sign"],
                    "start": period["start"],
                    "end": period["end"],
                    "days_left": (period["end"] - check_date).days
                })
    return retrograde_now


def get_upcoming_retrogrades(check_date=None, limit=5):
    """Get upcoming retrograde periods"""
    if check_date is None:
        check_date = date.today()

    upcoming = []
    for planet, periods in RETROGRADE_PERIODS.items():
        for period in periods:
            if period["start"] > check_date:
                days_until = (period["start"] - check_date).days
                upcoming.append({
                    "planet": planet,
                    "sign": period["sign"],
                    "start": period["start"],
                    "end": period["end"],
                    "days_until": days_until
                })

    upcoming.sort(key=lambda x: x["days_until"])
    return upcoming[:limit]


# ============== ASTRONOMICAL CALCULATION FUNCTIONS ==============

def julian_day(year, month, day, hour=0, utc_offset=0):
    """Calculate Julian Day Number
    hour: local time in hours (e.g., 12.5 for 12:30 PM)
    utc_offset: timezone offset in hours (e.g., 5.5 for IST)
    """
    # Convert local time to UTC
    utc_hour = hour - utc_offset

    # Adjust date if UTC hour goes negative or exceeds 24
    if utc_hour < 0:
        utc_hour += 24
        day -= 1
    elif utc_hour >= 24:
        utc_hour -= 24
        day += 1

    if month <= 2:
        year -= 1
        month += 12
    a = int(year / 100)
    b = 2 - a + int(a / 4)
    jd = int(365.25 * (year + 4716)) + int(30.6001 * (month + 1)) + day + utc_hour/24 + b - 1524.5
    return jd


# Timezone offsets for locations
TIMEZONE_OFFSETS = {
    "India": 5.5,
    "Nepal": 5.75,
    "Sri Lanka": 5.5,
    "Bangladesh": 6.0,
    "Pakistan": 5.0,
    "UAE": 4.0,
    "Iran": 3.5,
    "Kenya": 3.0,
    "South Africa": 2.0,
    "Nigeria": 1.0,
    "Ghana": 0.0,
    "Morocco": 1.0,
    "Egypt": 2.0,
    "UK": 0.0,
    "France": 1.0,
    "Germany": 1.0,
    "Italy": 1.0,
    "Spain": 1.0,
    "Netherlands": 1.0,
    "Russia": 3.0,
    "Japan": 9.0,
    "South Korea": 9.0,
    "China": 8.0,
    "Singapore": 8.0,
    "Thailand": 7.0,
    "Vietnam": 7.0,
    "Indonesia": 7.0,
    "Philippines": 8.0,
    "Australia": 10.0,
    "New Zealand": 12.0,
    "USA": -5.0,  # EST, varies by state
    "Canada": -5.0,
    "Mexico": -6.0,
    "Brazil": -3.0,
    "Argentina": -3.0,
    "Chile": -4.0,
    "Peru": -5.0,
    "Colombia": -5.0,
    "Default": 0.0,
}


def get_timezone_offset(country):
    """Get timezone offset for a country"""
    return TIMEZONE_OFFSETS.get(country, 0.0)


def get_sun_longitude(jd):
    """Calculate Sun's ecliptic longitude (tropical)"""
    t = (jd - 2451545.0) / 36525  # Julian centuries from J2000

    # Mean longitude of Sun
    l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t
    l0 = l0 % 360

    # Mean anomaly of Sun
    m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t
    m = math.radians(m % 360)

    # Equation of center
    c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * math.sin(m)
    c += (0.019993 - 0.000101 * t) * math.sin(2 * m)
    c += 0.000289 * math.sin(3 * m)

    sun_lon = (l0 + c) % 360
    return sun_lon


def get_moon_longitude(jd):
    """Calculate Moon's ecliptic longitude (tropical) - Improved accuracy using Meeus algorithm"""
    t = (jd - 2451545.0) / 36525
    t2 = t * t
    t3 = t2 * t
    t4 = t3 * t

    # Mean longitude of Moon (L')
    lp = 218.3164477 + 481267.88123421 * t - 0.0015786 * t2 + t3 / 538841 - t4 / 65194000
    lp = lp % 360

    # Mean elongation of Moon (D)
    d = 297.8501921 + 445267.1114034 * t - 0.0018819 * t2 + t3 / 545868 - t4 / 113065000
    d = math.radians(d % 360)

    # Sun's mean anomaly (M)
    m = 357.5291092 + 35999.0502909 * t - 0.0001536 * t2 + t3 / 24490000
    m = math.radians(m % 360)

    # Moon's mean anomaly (M')
    mp = 134.9633964 + 477198.8675055 * t + 0.0087414 * t2 + t3 / 69699 - t4 / 14712000
    mp = math.radians(mp % 360)

    # Moon's argument of latitude (F)
    f = 93.2720950 + 483202.0175233 * t - 0.0036539 * t2 - t3 / 3526000 + t4 / 863310000
    f = math.radians(f % 360)

    # Correction terms for eccentricity of Earth's orbit
    e = 1 - 0.002516 * t - 0.0000074 * t2

    # Sum of periodic terms for longitude (more complete series)
    # These are the main terms from Meeus' Astronomical Algorithms
    sl = 0
    sl += 6288774 * math.sin(mp)
    sl += 1274027 * math.sin(2 * d - mp)
    sl += 658314 * math.sin(2 * d)
    sl += 213618 * math.sin(2 * mp)
    sl -= 185116 * e * math.sin(m)
    sl -= 114332 * math.sin(2 * f)
    sl += 58793 * math.sin(2 * d - 2 * mp)
    sl += 57066 * e * math.sin(2 * d - m - mp)
    sl += 53322 * math.sin(2 * d + mp)
    sl += 45758 * e * math.sin(2 * d - m)
    sl -= 40923 * e * math.sin(m - mp)
    sl -= 34720 * math.sin(d)
    sl -= 30383 * e * math.sin(m + mp)
    sl += 15327 * math.sin(2 * d - 2 * f)
    sl -= 12528 * math.sin(mp + 2 * f)
    sl += 10980 * math.sin(mp - 2 * f)
    sl += 10675 * math.sin(4 * d - mp)
    sl += 10034 * math.sin(3 * mp)
    sl += 8548 * math.sin(4 * d - 2 * mp)
    sl -= 7888 * e * math.sin(2 * d + m - mp)
    sl -= 6766 * e * math.sin(2 * d + m)
    sl -= 5163 * math.sin(d - mp)
    sl += 4987 * e * math.sin(d + m)
    sl += 4036 * e * math.sin(2 * d - m + mp)
    sl += 3994 * math.sin(2 * d + 2 * mp)
    sl += 3861 * math.sin(4 * d)
    sl += 3665 * math.sin(2 * d - 3 * mp)
    sl -= 2689 * e * math.sin(m - 2 * mp)
    sl -= 2602 * math.sin(2 * d - mp + 2 * f)
    sl += 2390 * e * math.sin(2 * d - m - 2 * mp)
    sl -= 2348 * math.sin(d + mp)
    sl += 2236 * e * e * math.sin(2 * d - 2 * m)
    sl -= 2120 * e * math.sin(m + 2 * mp)
    sl -= 2069 * e * e * math.sin(2 * m)

    # Convert from 0.000001 degrees to degrees
    moon_lon = lp + sl / 1000000

    # Additional correction for nutation (simplified)
    omega = 125.04452 - 1934.136261 * t
    moon_lon -= 0.00478 * math.sin(math.radians(omega))

    moon_lon = moon_lon % 360
    if moon_lon < 0:
        moon_lon += 360

    return moon_lon


def get_planet_longitude(jd, planet):
    """Simplified planetary longitude calculation"""
    t = (jd - 2451545.0) / 36525

    # Orbital elements (simplified)
    planets_data = {
        "Mercury": {"a": 0.387, "e": 0.206, "i": 7.0, "l0": 252.25, "n": 149472.67},
        "Venus": {"a": 0.723, "e": 0.007, "i": 3.4, "l0": 181.98, "n": 58517.82},
        "Mars": {"a": 1.524, "e": 0.093, "i": 1.85, "l0": 355.43, "n": 19140.30},
        "Jupiter": {"a": 5.203, "e": 0.048, "i": 1.3, "l0": 34.33, "n": 3034.91},
        "Saturn": {"a": 9.537, "e": 0.054, "i": 2.49, "l0": 50.08, "n": 1222.11},
    }

    if planet not in planets_data:
        return 0

    p = planets_data[planet]
    mean_lon = (p["l0"] + p["n"] * t) % 360

    # Add perturbation based on planet
    if planet == "Mercury":
        mean_lon += 3.0 * math.sin(math.radians(mean_lon * 2))
    elif planet == "Venus":
        mean_lon += 0.8 * math.sin(math.radians(mean_lon * 3))
    elif planet == "Mars":
        mean_lon += 10.7 * math.sin(math.radians(mean_lon))
    elif planet == "Jupiter":
        mean_lon += 5.5 * math.sin(math.radians(mean_lon))
    elif planet == "Saturn":
        mean_lon += 6.4 * math.sin(math.radians(mean_lon))

    return mean_lon % 360


def get_rahu_ketu_longitude(jd):
    """Calculate Rahu (North Node) longitude - Ketu is opposite"""
    t = (jd - 2451545.0) / 36525
    # Mean longitude of ascending node
    omega = 125.04452 - 1934.136261 * t
    rahu = (omega % 360 + 360) % 360  # Rahu
    ketu = (rahu + 180) % 360  # Ketu is opposite
    return rahu, ketu


def get_ayanamsa(jd):
    """Calculate Lahiri Ayanamsa (tropical - sidereal difference) - More accurate"""
    # Lahiri ayanamsa is based on the position of the vernal equinox
    # Reference: Lahiri ayanamsa was 23°15' on Jan 1, 1950
    # It increases by approximately 50.29" per year

    # Julian day for Jan 1, 1950
    jd_1950 = 2433282.5

    # Years since 1950
    years = (jd - jd_1950) / 365.25

    # Lahiri ayanamsa on Jan 1, 1950 was 23.25 degrees (23°15')
    # Rate of precession: approximately 50.29 arcseconds per year = 0.01397 degrees/year
    ayanamsa = 23.25 + (years * 50.29 / 3600)

    # More precise calculation using the formula from Indian Astronomical Ephemeris
    t = (jd - 2451545.0) / 36525  # Julian centuries from J2000

    # Nutation correction
    omega = 125.04452 - 1934.136261 * t
    nutation = -0.00478 * math.sin(math.radians(omega))

    return ayanamsa + nutation


def tropical_to_sidereal(tropical_lon, jd):
    """Convert tropical longitude to sidereal (Vedic)"""
    ayanamsa = get_ayanamsa(jd)
    sidereal = (tropical_lon - ayanamsa) % 360
    return sidereal


def get_zodiac_sign(longitude):
    """Get zodiac sign from longitude"""
    sign_index = int(longitude / 30) % 12
    degree_in_sign = longitude % 30
    return ZODIAC_SIGNS[sign_index], degree_in_sign


def get_rashi(sidereal_longitude):
    """Get Vedic rashi from sidereal longitude"""
    rashi_index = int(sidereal_longitude / 30) % 12
    degree_in_rashi = sidereal_longitude % 30
    return RASHIS[rashi_index], degree_in_rashi


def get_nakshatra(sidereal_moon_lon):
    """Get nakshatra from sidereal Moon longitude"""
    nakshatra_span = 360 / 27  # 13.333 degrees each
    nakshatra_index = int(sidereal_moon_lon / nakshatra_span) % 27
    pada = int((sidereal_moon_lon % nakshatra_span) / (nakshatra_span / 4)) + 1
    return NAKSHATRAS[nakshatra_index], pada


def get_moon_phase(sun_lon, moon_lon):
    """Calculate moon phase from Sun and Moon longitudes"""
    phase_angle = (moon_lon - sun_lon) % 360
    phase_index = int(phase_angle / 45) % 8
    illumination = (1 - math.cos(math.radians(phase_angle))) / 2 * 100
    return MOON_PHASES[phase_index], illumination, phase_angle


def get_tithi(sun_lon, moon_lon):
    """Calculate tithi (lunar day)"""
    diff = (moon_lon - sun_lon) % 360
    tithi_num = int(diff / 12) + 1

    if tithi_num <= 15:
        paksha = "Shukla"  # Waxing
        tithi_in_paksha = tithi_num
    else:
        paksha = "Krishna"  # Waning
        tithi_in_paksha = tithi_num - 15

    tithi_names = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
                   "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
                   "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"]

    if tithi_in_paksha == 15:
        tithi_name = "Purnima" if paksha == "Shukla" else "Amavasya"
    else:
        tithi_name = tithi_names[tithi_in_paksha - 1]

    return f"{paksha} {tithi_name}", tithi_num


def get_planetary_hour(dt, lat, lon):
    """Calculate current planetary hour (Chaldean system)"""
    # Get day of week (0=Monday)
    day_ruler_index = dt.weekday()
    day_ruler = WEEKDAY_RULERS[day_ruler_index]

    # Simplified: divide day into 12 hours each for day/night
    hour = dt.hour
    if 6 <= hour < 18:  # Daytime (simplified)
        hour_index = (hour - 6)
    else:  # Nighttime
        hour_index = (hour - 18) % 12 + 12

    # Find starting index in planetary hours order
    start_index = PLANETARY_HOURS_ORDER.index(day_ruler)
    current_index = (start_index + hour_index) % 7

    return PLANETARY_HOURS_ORDER[current_index], day_ruler


def get_all_planetary_positions(dt, lat=0, lon=0, country="Default"):
    """Get all planetary positions for given datetime"""
    utc_offset = get_timezone_offset(country)
    jd = julian_day(dt.year, dt.month, dt.day, dt.hour + dt.minute/60, utc_offset)

    positions = {}

    # Sun
    sun_trop = get_sun_longitude(jd)
    sun_sid = tropical_to_sidereal(sun_trop, jd)
    sign, deg = get_zodiac_sign(sun_trop)
    rashi, rashi_deg = get_rashi(sun_sid)
    positions["Sun"] = {
        "tropical": sun_trop,
        "sidereal": sun_sid,
        "sign": sign,
        "degree_in_sign": deg,
        "rashi": rashi,
        "degree_in_rashi": rashi_deg
    }

    # Moon
    moon_trop = get_moon_longitude(jd)
    moon_sid = tropical_to_sidereal(moon_trop, jd)
    sign, deg = get_zodiac_sign(moon_trop)
    rashi, rashi_deg = get_rashi(moon_sid)
    nakshatra, pada = get_nakshatra(moon_sid)
    positions["Moon"] = {
        "tropical": moon_trop,
        "sidereal": moon_sid,
        "sign": sign,
        "degree_in_sign": deg,
        "rashi": rashi,
        "degree_in_rashi": rashi_deg,
        "nakshatra": nakshatra,
        "pada": pada
    }

    # Other planets
    for planet in ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]:
        trop = get_planet_longitude(jd, planet)
        sid = tropical_to_sidereal(trop, jd)
        sign, deg = get_zodiac_sign(trop)
        rashi, rashi_deg = get_rashi(sid)
        positions[planet] = {
            "tropical": trop,
            "sidereal": sid,
            "sign": sign,
            "degree_in_sign": deg,
            "rashi": rashi,
            "degree_in_rashi": rashi_deg
        }

    # Rahu and Ketu (lunar nodes)
    rahu, ketu = get_rahu_ketu_longitude(jd)
    rahu_sid = tropical_to_sidereal(rahu, jd)
    ketu_sid = tropical_to_sidereal(ketu, jd)

    sign, deg = get_zodiac_sign(rahu)
    rashi, rashi_deg = get_rashi(rahu_sid)
    positions["Rahu"] = {
        "tropical": rahu,
        "sidereal": rahu_sid,
        "sign": sign,
        "degree_in_sign": deg,
        "rashi": rashi,
        "degree_in_rashi": rashi_deg
    }

    sign, deg = get_zodiac_sign(ketu)
    rashi, rashi_deg = get_rashi(ketu_sid)
    positions["Ketu"] = {
        "tropical": ketu,
        "sidereal": ketu_sid,
        "sign": sign,
        "degree_in_sign": deg,
        "rashi": rashi,
        "degree_in_rashi": rashi_deg
    }

    # Moon phase
    phase, illum, phase_angle = get_moon_phase(sun_trop, moon_trop)
    positions["moon_phase"] = {"phase": phase, "illumination": illum, "angle": phase_angle}

    # Tithi
    tithi, tithi_num = get_tithi(sun_trop, moon_trop)
    positions["tithi"] = {"name": tithi, "number": tithi_num}

    # Planetary hour
    p_hour, day_ruler = get_planetary_hour(dt, lat, lon)
    positions["planetary_hour"] = {"ruler": p_hour, "day_ruler": day_ruler}

    # Ayanamsa
    positions["ayanamsa"] = get_ayanamsa(jd)

    return positions


# ============== HELPER FUNCTIONS ==============
def calculate_altitude(obj_dec, lat):
    lat_rad = np.radians(lat)
    dec_rad = np.radians(obj_dec)
    sin_alt = np.sin(lat_rad) * np.sin(dec_rad) + np.cos(lat_rad) * np.cos(dec_rad)
    return np.degrees(np.arcsin(np.clip(sin_alt, -1, 1)))


def get_light_travel_events(distance_ly):
    current_year = datetime.now().year
    light_left_year = current_year - distance_ly

    if light_left_year < -4500000000:
        era = "Before Earth existed!"
    elif light_left_year < -65000000:
        era = "Dinosaurs roamed the Earth"
    elif light_left_year < -200000:
        era = "Early mammals evolved"
    elif light_left_year < -10000:
        era = "Early humans lived as hunter-gatherers"
    elif light_left_year < 0:
        era = "Ancient civilizations flourished"
    elif light_left_year < 1500:
        era = "Medieval period"
    elif light_left_year < 1900:
        era = "Pre-industrial era"
    else:
        era = f"Year {int(light_left_year)}"

    return light_left_year, era


def find_cosmic_twin_star(birth_year):
    current_year = datetime.now().year
    your_age = current_year - birth_year
    twins = [s for s in STARS_WITH_AGES if abs(s["distance_ly"] - your_age) < 3]
    return twins


def create_location_map(selected_lat, selected_lon, selected_name):
    """Create an interactive map centered on selected location"""
    m = folium.Map(
        location=[selected_lat, selected_lon],
        zoom_start=3,
        tiles='CartoDB dark_matter'
    )

    # Add markers for all locations
    for key, loc in LOCATIONS.items():
        # Color based on type
        colors = {
            "city": "blue",
            "town": "green",
            "village": "orange",
            "observatory": "red",
            "island": "purple",
            "arctic": "white",
            "research": "pink"
        }
        color = colors.get(loc.get("type", "city"), "blue")

        # Highlight selected location
        if loc["lat"] == selected_lat and loc["lon"] == selected_lon:
            folium.Marker(
                [loc["lat"], loc["lon"]],
                popup=f"<b>{loc['name']}</b><br>You are here!",
                icon=folium.Icon(color="red", icon="star")
            ).add_to(m)
        else:
            folium.CircleMarker(
                [loc["lat"], loc["lon"]],
                radius=5,
                popup=loc["name"],
                color=color,
                fill=True,
                fillOpacity=0.7
            ).add_to(m)

    return m


# ============== MAIN APP ==============

# Header with Logo and Theme Toggle
col_logo, col_theme = st.columns([4, 1])

with col_logo:
    st.markdown("""
    <div class="logo-container">
        <span class="logo-icon">✦</span>
        <div>
            <h1 class="main-header" style="margin: 0; text-align: left;">AstroData</h1>
        </div>
    </div>
    """, unsafe_allow_html=True)

with col_theme:
    theme_icon = "🌙" if st.session_state["theme"] == "dark" else "☀️"
    if st.button(f"{theme_icon} {'Light' if st.session_state['theme'] == 'dark' else 'Dark'}", key="theme_toggle"):
        st.session_state["theme"] = "light" if st.session_state["theme"] == "dark" else "dark"
        st.rerun()

st.markdown('<p class="sub-header">Explore the Universe from Anywhere on Earth</p>', unsafe_allow_html=True)

# Sidebar with personal profile and location
with st.sidebar:
    # Personal Profile Section
    st.markdown("### 👤 Your Profile")

    with st.expander("Enter Your Details", expanded=False):
        user_display_name = st.text_input("Your Name:", value=st.session_state.get("user_display_name", ""), key="name_input")
        if user_display_name:
            st.session_state["user_display_name"] = user_display_name

        birth_date = st.date_input(
            "Birth Date:",
            value=st.session_state.get("birth_date", date(2000, 1, 1)),
            min_value=date(1900, 1, 1),
            max_value=date.today(),
            key="birth_date_input"
        )
        st.session_state["birth_date"] = birth_date

        birth_time = st.time_input(
            "Birth Time (if known):",
            value=st.session_state.get("birth_time", datetime.strptime("12:00", "%H:%M").time()),
            key="birth_time_input"
        )
        st.session_state["birth_time"] = birth_time

        if user_display_name:
            st.success(f"Welcome, {user_display_name}!")

    # Get profile values
    profile_name = st.session_state.get("user_display_name", "Cosmic Explorer")
    profile_birth_date = st.session_state.get("birth_date", date(2000, 1, 1))
    profile_birth_time = st.session_state.get("birth_time", datetime.strptime("12:00", "%H:%M").time())

    st.markdown("---")
    st.markdown("### 📍 Your Location")

    # Location selection method
    location_method = st.radio(
        "How to select location:",
        ["Search by Name", "Browse by Country", "Click on Map", "Enter Coordinates"],
        label_visibility="collapsed"
    )

    if location_method == "Search by Name":
        # Search box
        search_query = st.text_input("Search city or place:", "")

        if search_query:
            matches = {k: v for k, v in LOCATIONS.items()
                      if search_query.lower() in v["name"].lower()
                      or search_query.lower() in k.lower()}
            if matches:
                selected_key = st.selectbox(
                    "Select from matches:",
                    list(matches.keys()),
                    format_func=lambda x: f"{LOCATIONS[x]['name']} ({LOCATIONS[x]['type']})"
                )
            else:
                st.warning("No matches found. Try a different search.")
                selected_key = "mumbai"
        else:
            selected_key = st.selectbox(
                "Or pick a location:",
                list(LOCATIONS.keys()),
                format_func=lambda x: LOCATIONS[x]["name"],
                index=0
            )

        user_lat = LOCATIONS[selected_key]["lat"]
        user_lon = LOCATIONS[selected_key]["lon"]
        user_name = LOCATIONS[selected_key]["name"]
        user_country = LOCATIONS[selected_key]["country"]

    elif location_method == "Browse by Country":
        selected_country = st.selectbox("Select country:", COUNTRIES)
        country_locations = {k: v for k, v in LOCATIONS.items() if v["country"] == selected_country}

        if country_locations:
            selected_key = st.selectbox(
                "Select location:",
                list(country_locations.keys()),
                format_func=lambda x: f"{LOCATIONS[x]['name']} ({LOCATIONS[x]['type']})"
            )
            user_lat = LOCATIONS[selected_key]["lat"]
            user_lon = LOCATIONS[selected_key]["lon"]
            user_name = LOCATIONS[selected_key]["name"]
            user_country = LOCATIONS[selected_key]["country"]
        else:
            user_lat, user_lon, user_name, user_country = 0, 0, "Unknown", "Default"

    elif location_method == "Click on Map":
        st.info("Click anywhere on the map to set your location!")
        user_lat = st.session_state.get("clicked_lat", 19.076)
        user_lon = st.session_state.get("clicked_lon", 72.877)
        user_name = st.session_state.get("clicked_name", "Custom Location")
        user_country = "India"  # Default for map clicks, can be improved

    else:  # Enter Coordinates
        user_lat = st.number_input("Latitude:", value=19.076, min_value=-90.0, max_value=90.0, step=0.001)
        user_lon = st.number_input("Longitude:", value=72.877, min_value=-180.0, max_value=180.0, step=0.001)
        user_name = st.text_input("Location name:", f"({user_lat:.2f}°, {user_lon:.2f}°)")
        user_country = st.selectbox("Country (for timezone):", list(TIMEZONE_OFFSETS.keys()), index=0)

    # Display selected location
    st.markdown("---")
    hemisphere = "Northern" if user_lat >= 0 else "Southern"
    st.markdown(f"**Selected:** {user_name}")
    st.markdown(f"**Hemisphere:** {hemisphere}")
    st.markdown(f"**Coordinates:** {user_lat:.4f}°, {user_lon:.4f}°")

    # Navigation
    st.markdown("---")
    st.markdown("### 🚀 Explore")
    page = st.radio(
        "Choose your journey:",
        [
            "🗺️ World Map",
            "🌙 Celestial Calendar",
            "📜 Birth Chart",
            "🔄 Retrograde Tracker",
            "⛅ Cosmic Weather",
            "🕰️ Cosmic Time Machine",
            "⭐ Your Cosmic Twin",
            "🌍 Shared Sky",
            "✉️ Cosmic Postcard",
            "🔭 Light's Journey",
            "🪐 Exoplanet Explorer",
            "🌟 Star Stories"
        ],
        label_visibility="collapsed"
    )


# ============== WORLD MAP PAGE ==============
if page == "🗺️ World Map":
    st.header("🗺️ Explore the World")
    st.markdown(f"**150+ locations worldwide** - Cities, villages, observatories, and remote places")

    col1, col2 = st.columns([2, 1])

    with col1:
        # Create and display map
        m = create_location_map(user_lat, user_lon, user_name)

        # Handle map clicks
        map_data = st_folium(m, width=700, height=500, returned_objects=["last_clicked"])

        if map_data and map_data.get("last_clicked"):
            clicked_lat = map_data["last_clicked"]["lat"]
            clicked_lon = map_data["last_clicked"]["lng"]
            st.session_state["clicked_lat"] = clicked_lat
            st.session_state["clicked_lon"] = clicked_lon
            st.session_state["clicked_name"] = f"Custom ({clicked_lat:.2f}°, {clicked_lon:.2f}°)"
            st.success(f"📍 Selected: {clicked_lat:.4f}°, {clicked_lon:.4f}°")

    with col2:
        st.subheader("Location Stats")

        # Count by type
        type_counts = {}
        for loc in LOCATIONS.values():
            t = loc.get("type", "city")
            type_counts[t] = type_counts.get(t, 0) + 1

        st.markdown("**By Type:**")
        for t, count in sorted(type_counts.items(), key=lambda x: -x[1]):
            emoji = {"city": "🏙️", "town": "🏘️", "village": "🏡", "observatory": "🔭",
                    "island": "🏝️", "arctic": "❄️", "research": "🔬"}.get(t, "📍")
            st.markdown(f"{emoji} {t.title()}: {count}")

        st.markdown("---")
        st.markdown("**By Region:**")
        regions = {}
        for loc in LOCATIONS.values():
            country = loc["country"]
            if country in ["India", "China", "Japan", "South Korea", "Thailand", "Vietnam",
                          "Indonesia", "Philippines", "Singapore", "UAE", "Iran", "Pakistan",
                          "Bangladesh", "Nepal", "Sri Lanka", "Mongolia"]:
                region = "Asia"
            elif country in ["Kenya", "Nigeria", "Egypt", "South Africa", "Ethiopia", "Tanzania",
                            "Uganda", "Ghana", "Morocco", "Tunisia", "Rwanda", "Madagascar"]:
                region = "Africa"
            elif country in ["USA", "Canada", "Mexico", "Brazil", "Argentina", "Chile", "Peru",
                            "Colombia", "Cuba", "Jamaica", "Ecuador", "French Polynesia"]:
                region = "Americas"
            elif country in ["Australia", "New Zealand", "Fiji"]:
                region = "Oceania"
            elif country == "Antarctica":
                region = "Antarctica"
            else:
                region = "Europe"
            regions[region] = regions.get(region, 0) + 1

        for region, count in sorted(regions.items(), key=lambda x: -x[1]):
            st.markdown(f"• {region}: {count}")


# ============== CELESTIAL CALENDAR PAGE ==============

elif page == "🌙 Celestial Calendar":
    st.header("🌙 Celestial Calendar")
    st.markdown("**Real-time planetary positions for astronomy learners and astrologers**")

    # Date and time selection
    col_dt1, col_dt2, col_dt3 = st.columns([1, 1, 1])

    with col_dt1:
        use_current = st.checkbox("Use current time", value=True)

    with col_dt2:
        if not use_current:
            selected_date = st.date_input("Date:", value=date.today())
        else:
            selected_date = date.today()

    with col_dt3:
        if not use_current:
            selected_time = st.time_input("Time:", value=datetime.now().time())
        else:
            selected_time = datetime.now().time()

    # Create datetime object
    selected_datetime = datetime.combine(selected_date, selected_time)

    # Get all planetary positions (with timezone)
    positions = get_all_planetary_positions(selected_datetime, user_lat, user_lon, user_country)

    # Display tabs for different views
    tab1, tab2, tab3, tab4 = st.tabs(["🌟 Overview", "🔮 Western Astrology", "🕉️ Vedic Jyotish", "📊 Detailed Data"])

    with tab1:
        st.subheader(f"Celestial Snapshot: {selected_datetime.strftime('%B %d, %Y at %H:%M')}")
        st.markdown(f"**Location:** {user_name}")

        # Moon phase and key info
        col1, col2, col3 = st.columns(3)

        with col1:
            phase = positions["moon_phase"]["phase"]
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="font-size: 3rem;">{phase['emoji']}</div>
                <div style="font-size: 1.2rem; color: #a78bfa;"><b>{phase['name']}</b></div>
                <div style="color: #9ca3af;">{positions['moon_phase']['illumination']:.1f}% illuminated</div>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            tithi = positions["tithi"]["name"]
            nakshatra = positions["Moon"]["nakshatra"]
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="font-size: 1.5rem; color: #fbbf24;">Tithi</div>
                <div style="font-size: 1.2rem;"><b>{tithi}</b></div>
                <div style="color: #9ca3af;">Nakshatra: {nakshatra['name']}</div>
            </div>
            """, unsafe_allow_html=True)

        with col3:
            p_hour = positions["planetary_hour"]
            planet_symbol = PLANETS[p_hour["ruler"]]["symbol"]
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="font-size: 2rem;">{planet_symbol}</div>
                <div style="font-size: 1.2rem;"><b>{p_hour['ruler']} Hour</b></div>
                <div style="color: #9ca3af;">Day ruler: {p_hour['day_ruler']}</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("---")

        # Quick planetary positions
        st.subheader("Current Planetary Positions")

        planet_order = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]

        cols = st.columns(3)
        for i, planet in enumerate(planet_order):
            with cols[i % 3]:
                pos = positions[planet]
                symbol = PLANETS[planet]["symbol"]
                sign = pos["sign"]
                deg = pos["degree_in_sign"]

                st.markdown(f"""
                <div style="background: rgba(99, 102, 241, 0.1); padding: 0.75rem; border-radius: 10px; margin: 0.5rem 0; border-left: 3px solid {PLANETS[planet]['color']};">
                    <span style="font-size: 1.5rem;">{symbol}</span>
                    <b>{planet}</b><br>
                    <span style="color: #a78bfa;">{sign['symbol']} {sign['name']}</span>
                    <span style="color: #9ca3af;"> {deg:.1f}°</span>
                </div>
                """, unsafe_allow_html=True)

    with tab2:
        st.subheader("Western (Tropical) Astrology")
        st.markdown(f"*Ayanamsa: {positions['ayanamsa']:.2f}° (tropical positions)*")

        # Sun and Moon signs
        col1, col2 = st.columns(2)

        with col1:
            sun = positions["Sun"]
            st.markdown(f"""
            <div class="cosmic-card">
                <h3>☉ Sun Sign</h3>
                <div style="font-size: 3rem;">{sun['sign']['symbol']}</div>
                <div style="font-size: 1.5rem; color: #fbbf24;"><b>{sun['sign']['name']}</b></div>
                <div>Element: {sun['sign']['element']} | Quality: {sun['sign']['quality']}</div>
                <div style="color: #9ca3af;">Position: {sun['degree_in_sign']:.2f}° in {sun['sign']['name']}</div>
                <div style="color: #9ca3af;">Ruled by: {sun['sign']['ruler']}</div>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            moon = positions["Moon"]
            st.markdown(f"""
            <div class="cosmic-card">
                <h3>☽ Moon Sign</h3>
                <div style="font-size: 3rem;">{moon['sign']['symbol']}</div>
                <div style="font-size: 1.5rem; color: #c0c0c0;"><b>{moon['sign']['name']}</b></div>
                <div>Element: {moon['sign']['element']} | Quality: {moon['sign']['quality']}</div>
                <div style="color: #9ca3af;">Position: {moon['degree_in_sign']:.2f}° in {moon['sign']['name']}</div>
                <div style="color: #9ca3af;">Ruled by: {moon['sign']['ruler']}</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("---")
        st.subheader("All Planets in Signs (Tropical)")

        # Create table
        table_data = []
        for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]:
            pos = positions[planet]
            table_data.append({
                "Planet": f"{PLANETS[planet]['symbol']} {planet}",
                "Sign": f"{pos['sign']['symbol']} {pos['sign']['name']}",
                "Degree": f"{pos['degree_in_sign']:.2f}°",
                "Element": pos['sign']['element'],
                "Ruler": pos['sign']['ruler']
            })

        st.dataframe(pd.DataFrame(table_data), use_container_width=True, hide_index=True)

        # Element balance
        st.markdown("---")
        st.subheader("Elemental Balance")

        elements = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
        for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]:
            element = positions[planet]["sign"]["element"]
            elements[element] += 1

        cols = st.columns(4)
        emoji_map = {"Fire": "🔥", "Earth": "🌍", "Air": "💨", "Water": "💧"}
        for i, (elem, count) in enumerate(elements.items()):
            with cols[i]:
                st.metric(f"{emoji_map[elem]} {elem}", f"{count} planets")

    with tab3:
        st.subheader("Vedic Jyotish (Sidereal)")
        st.markdown(f"*Lahiri Ayanamsa: {positions['ayanamsa']:.2f}°*")

        # Rashi and Nakshatra
        col1, col2 = st.columns(2)

        with col1:
            sun = positions["Sun"]
            st.markdown(f"""
            <div class="cosmic-card">
                <h3>☉ Surya Rashi (Sun)</h3>
                <div style="font-size: 3rem;">{sun['rashi']['symbol']}</div>
                <div style="font-size: 1.5rem; color: #fbbf24;"><b>{sun['rashi']['name']}</b></div>
                <div style="color: #9ca3af;">({sun['rashi']['english']})</div>
                <div>Lord: {sun['rashi']['lord']}</div>
                <div style="color: #9ca3af;">Position: {sun['degree_in_rashi']:.2f}°</div>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            moon = positions["Moon"]
            nakshatra = moon["nakshatra"]
            pada = moon["pada"]
            st.markdown(f"""
            <div class="cosmic-card">
                <h3>☽ Chandra Rashi (Moon)</h3>
                <div style="font-size: 3rem;">{moon['rashi']['symbol']}</div>
                <div style="font-size: 1.5rem; color: #c0c0c0;"><b>{moon['rashi']['name']}</b></div>
                <div style="color: #9ca3af;">({moon['rashi']['english']})</div>
                <div>Lord: {moon['rashi']['lord']}</div>
                <div style="color: #9ca3af;">Position: {moon['degree_in_rashi']:.2f}°</div>
            </div>
            """, unsafe_allow_html=True)

        # Nakshatra details
        st.markdown("---")
        st.subheader("Nakshatra (Lunar Mansion)")

        moon = positions["Moon"]
        nakshatra = moon["nakshatra"]
        pada = moon["pada"]

        st.markdown(f"""
        <div class="cosmic-card">
            <h3>Moon's Nakshatra: {nakshatra['name']}</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 1rem;">
                <div>
                    <div style="color: #9ca3af;">Pada (Quarter)</div>
                    <div style="font-size: 1.5rem; color: #a78bfa;"><b>{pada}</b> of 4</div>
                </div>
                <div>
                    <div style="color: #9ca3af;">Nakshatra Lord</div>
                    <div style="font-size: 1.2rem;"><b>{nakshatra['lord']}</b></div>
                </div>
                <div>
                    <div style="color: #9ca3af;">Presiding Deity</div>
                    <div style="font-size: 1.2rem;"><b>{nakshatra['deity']}</b></div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Tithi and Karana
        st.markdown("---")
        st.subheader("Panchanga (Five Elements)")

        col1, col2, col3 = st.columns(3)

        with col1:
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="color: #9ca3af;">Tithi</div>
                <div style="font-size: 1.2rem;"><b>{positions['tithi']['name']}</b></div>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="color: #9ca3af;">Nakshatra</div>
                <div style="font-size: 1.2rem;"><b>{nakshatra['name']}</b></div>
            </div>
            """, unsafe_allow_html=True)

        with col3:
            weekday_names = ["Somvar", "Mangalvar", "Budhvar", "Guruvar", "Shukravar", "Shanivar", "Ravivar"]
            vara = weekday_names[selected_datetime.weekday()]
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="color: #9ca3af;">Vara (Day)</div>
                <div style="font-size: 1.2rem;"><b>{vara}</b></div>
            </div>
            """, unsafe_allow_html=True)

        # Graha positions
        st.markdown("---")
        st.subheader("Graha Sthiti (Planetary Positions - Sidereal)")

        table_data = []
        for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]:
            pos = positions[planet]
            vedic_name = PLANETS[planet]["vedic"]
            table_data.append({
                "Graha": f"{PLANETS[planet]['symbol']} {vedic_name}",
                "Rashi": f"{pos['rashi']['symbol']} {pos['rashi']['name']}",
                "Degree": f"{pos['degree_in_rashi']:.2f}°",
                "Lord": pos['rashi']['lord']
            })

        st.dataframe(pd.DataFrame(table_data), use_container_width=True, hide_index=True)

    with tab4:
        st.subheader("Detailed Astronomical Data")

        # Technical info
        st.markdown(f"""
        <div class="cosmic-card">
            <h4>Calculation Parameters</h4>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                <div>
                    <div style="color: #9ca3af;">Date & Time</div>
                    <div><b>{selected_datetime.strftime('%Y-%m-%d %H:%M:%S')}</b></div>
                </div>
                <div>
                    <div style="color: #9ca3af;">Location</div>
                    <div><b>{user_name}</b></div>
                </div>
                <div>
                    <div style="color: #9ca3af;">Coordinates</div>
                    <div><b>{user_lat:.4f}°, {user_lon:.4f}°</b></div>
                </div>
                <div>
                    <div style="color: #9ca3af;">Ayanamsa (Lahiri)</div>
                    <div><b>{positions['ayanamsa']:.4f}°</b></div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        st.markdown("---")
        st.subheader("Complete Planetary Longitudes")

        # Full table with both systems
        table_data = []
        for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]:
            pos = positions[planet]
            table_data.append({
                "Planet": f"{PLANETS[planet]['symbol']} {planet}",
                "Tropical °": f"{pos['tropical']:.4f}°",
                "Sidereal °": f"{pos['sidereal']:.4f}°",
                "Western Sign": f"{pos['sign']['name']} {pos['degree_in_sign']:.2f}°",
                "Vedic Rashi": f"{pos['rashi']['name']} {pos['degree_in_rashi']:.2f}°"
            })

        st.dataframe(pd.DataFrame(table_data), use_container_width=True, hide_index=True)

        # Download option
        st.markdown("---")
        csv_data = pd.DataFrame(table_data).to_csv(index=False)
        st.download_button(
            label="Download as CSV",
            data=csv_data,
            file_name=f"planetary_positions_{selected_datetime.strftime('%Y%m%d_%H%M')}.csv",
            mime="text/csv"
        )


# ============== BIRTH CHART PAGE ==============

elif page == "📜 Birth Chart":
    st.header("📜 Your Cosmic Birth Chart")
    st.markdown("**Discover your unique celestial blueprint at the moment of your birth**")

    # Get birth details
    col1, col2 = st.columns([1, 2])

    with col1:
        st.subheader("Birth Details")
        chart_name = st.text_input("Your Name:", value=profile_name if profile_name != "Cosmic Explorer" else "")
        chart_date = st.date_input("Birth Date:", value=profile_birth_date)
        chart_time = st.time_input("Birth Time:", value=profile_birth_time)
        chart_location = st.selectbox(
            "Birth Place:",
            list(LOCATIONS.keys()),
            format_func=lambda x: LOCATIONS[x]["name"],
            index=list(LOCATIONS.keys()).index("mumbai") if "mumbai" in LOCATIONS else 0
        )

        birth_lat = LOCATIONS[chart_location]["lat"]
        birth_lon = LOCATIONS[chart_location]["lon"]
        birth_place = LOCATIONS[chart_location]["name"]
        birth_country = LOCATIONS[chart_location]["country"]

    with col2:
        if chart_name:
            # Calculate birth chart
            birth_datetime = datetime.combine(chart_date, chart_time)
            birth_positions = get_all_planetary_positions(birth_datetime, birth_lat, birth_lon, birth_country)

            # Life path and name numbers
            life_path = calculate_life_path_number(chart_date)
            name_number = calculate_name_number(chart_name)
            life_meaning = BIRTH_NUMBER_MEANINGS.get(life_path, BIRTH_NUMBER_MEANINGS[1])
            name_meaning = BIRTH_NUMBER_MEANINGS.get(name_number, BIRTH_NUMBER_MEANINGS[1])

            # Get positions
            sun_rashi = birth_positions["Sun"]["rashi"]
            moon_rashi = birth_positions["Moon"]["rashi"]
            nakshatra = birth_positions["Moon"]["nakshatra"]
            pada = birth_positions["Moon"]["pada"]
            sun_sign_western = birth_positions["Sun"]["sign"]
            moon_sign_western = birth_positions["Moon"]["sign"]
            tz_offset = get_timezone_offset(birth_country)

            st.markdown(f"""
            <div class="cosmic-card">
                <h2 style="text-align: center; color: #a78bfa;">✨ {chart_name}'s Cosmic Profile ✨</h2>
                <div style="text-align: center; margin: 1rem 0;">
                    <div style="font-size: 0.9rem; color: #9ca3af;">Born on {chart_date.strftime('%B %d, %Y')} at {chart_time.strftime('%H:%M')}</div>
                    <div style="font-size: 0.9rem; color: #9ca3af;">in {birth_place} (UTC{'+' if tz_offset >= 0 else ''}{tz_offset})</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

            # Toggle between Science, Vedic and Western
            astro_system = st.radio(
                "Choose View:",
                ["🔭 Science & Astronomy", "🕉️ Vedic Jyotish (Sidereal)", "🔮 Western Astrology (Tropical)", "📊 Compare All"],
                horizontal=True,
                key="astro_system_toggle"
            )

            st.markdown("---")

            # ===== SCIENCE/ASTRONOMY VIEW =====
            if "Science" in astro_system:
                st.markdown("### Astronomical Positions (Scientific)")
                st.caption("Based on actual celestial mechanics - no astrological interpretations")

                st.info("**Note:** This view shows the actual astronomical positions of celestial bodies as observed from Earth. These are scientific measurements, not astrological predictions.")

                # Sun and Moon positions (scientific)
                col_s1, col_s2 = st.columns(2)
                with col_s1:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center;">
                        <div style="font-size: 2.5rem;">☀️</div>
                        <div style="color: #fbbf24;"><b>Sun Position</b></div>
                        <div style="font-size: 1.2rem;">Ecliptic Longitude: {birth_positions['Sun']['tropical']:.2f}°</div>
                        <div style="color: #9ca3af;">Constellation Region: {sun_sign_western['name']}</div>
                        <div style="color: #9ca3af; font-size: 0.8rem;">Distance: ~93 million miles from Earth</div>
                    </div>
                    """, unsafe_allow_html=True)

                with col_s2:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center;">
                        <div style="font-size: 2.5rem;">🌙</div>
                        <div style="color: #c0c0c0;"><b>Moon Position</b></div>
                        <div style="font-size: 1.2rem;">Ecliptic Longitude: {birth_positions['Moon']['tropical']:.2f}°</div>
                        <div style="color: #9ca3af;">Constellation Region: {moon_sign_western['name']}</div>
                        <div style="color: #9ca3af; font-size: 0.8rem;">Distance: ~238,855 miles from Earth</div>
                    </div>
                    """, unsafe_allow_html=True)

                # Scientific planetary data table
                st.markdown("---")
                st.markdown("#### Planetary Positions (Ecliptic Coordinates)")
                st.caption("Measured from the Vernal Equinox (0° Aries point)")

                science_table = []
                planet_distances = {
                    "Sun": "93 million mi", "Moon": "238,855 mi", "Mercury": "48-138 million mi",
                    "Venus": "24-162 million mi", "Mars": "34-250 million mi",
                    "Jupiter": "365-601 million mi", "Saturn": "746-1 billion mi",
                    "Rahu": "N/A (Lunar Node)", "Ketu": "N/A (Lunar Node)"
                }
                for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]:
                    pos = birth_positions[planet]
                    science_table.append({
                        "Body": f"{PLANETS[planet]['symbol']} {planet}",
                        "Ecliptic Lon (°)": f"{pos['tropical']:.4f}°",
                        "In Constellation": pos['sign']['name'],
                        "Approx Distance": planet_distances[planet]
                    })
                st.dataframe(pd.DataFrame(science_table), use_container_width=True, hide_index=True)

                # Educational note
                st.markdown("---")
                with st.expander("📚 Understanding the Science"):
                    st.markdown("""
                    **What is Ecliptic Longitude?**
                    The ecliptic is the apparent path of the Sun across the sky over a year. Planets orbit roughly along this plane.
                    We measure positions in degrees (0° to 360°) from the Vernal Equinox point.

                    **Tropical vs Sidereal Coordinates:**
                    - **Tropical (used here):** Based on Earth's seasons. 0° = Spring Equinox point
                    - **Sidereal:** Based on fixed stars. Differs by ~24° due to precession

                    **Why Constellations Matter Scientifically:**
                    The zodiac constellations are simply star patterns in the background. A planet being "in" a constellation
                    means it appears in that direction from Earth's perspective - there's no physical connection.

                    **Astronomy vs Astrology:**
                    - **Astronomy** is the scientific study of celestial objects, physics, and the universe
                    - **Astrology** is a belief system that celestial positions influence human affairs
                    """)

            # ===== VEDIC VIEW =====
            elif "Vedic" in astro_system:
                st.markdown("### Vedic Birth Chart (Sidereal)")
                st.caption(f"Lahiri Ayanamsa: {birth_positions['ayanamsa']:.2f}°")

                col_v1, col_v2, col_v3 = st.columns(3)
                with col_v1:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center;">
                        <div style="font-size: 2.5rem;">{sun_rashi['symbol']}</div>
                        <div style="color: #fbbf24;"><b>Surya Rashi</b></div>
                        <div style="font-size: 1.4rem;">{sun_rashi['name']}</div>
                        <div style="color: #9ca3af;">({sun_rashi['english']})</div>
                        <div style="color: #9ca3af; font-size: 0.9rem;">Lord: {sun_rashi['lord']}</div>
                        <div style="color: #a78bfa; font-size: 0.8rem;">{birth_positions['Sun']['degree_in_rashi']:.1f}°</div>
                    </div>
                    """, unsafe_allow_html=True)

                with col_v2:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center;">
                        <div style="font-size: 2.5rem;">{moon_rashi['symbol']}</div>
                        <div style="color: #c0c0c0;"><b>Chandra Rashi</b></div>
                        <div style="font-size: 1.4rem;">{moon_rashi['name']}</div>
                        <div style="color: #9ca3af;">({moon_rashi['english']})</div>
                        <div style="color: #9ca3af; font-size: 0.9rem;">Lord: {moon_rashi['lord']}</div>
                        <div style="color: #a78bfa; font-size: 0.8rem;">{birth_positions['Moon']['degree_in_rashi']:.1f}°</div>
                    </div>
                    """, unsafe_allow_html=True)

                with col_v3:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center;">
                        <div style="font-size: 2.5rem;">⭐</div>
                        <div style="color: #a78bfa;"><b>Janma Nakshatra</b></div>
                        <div style="font-size: 1.4rem;">{nakshatra['name']}</div>
                        <div style="color: #9ca3af;">Pada {pada}</div>
                        <div style="color: #9ca3af; font-size: 0.9rem;">Lord: {nakshatra['lord']}</div>
                        <div style="color: #9ca3af; font-size: 0.8rem;">Deity: {nakshatra['deity']}</div>
                    </div>
                    """, unsafe_allow_html=True)

                # Graha table (Vedic)
                st.markdown("---")
                st.markdown("#### Graha Sthiti (Planetary Positions)")
                vedic_table = []
                for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]:
                    pos = birth_positions[planet]
                    vedic_name = PLANETS[planet]["vedic"]
                    vedic_table.append({
                        "Graha": f"{PLANETS[planet]['symbol']} {vedic_name}",
                        "Rashi": f"{pos['rashi']['symbol']} {pos['rashi']['name']}",
                        "Degree": f"{pos['degree_in_rashi']:.2f}°",
                        "Lord": pos['rashi']['lord']
                    })
                st.dataframe(pd.DataFrame(vedic_table), use_container_width=True, hide_index=True)

            # ===== WESTERN VIEW =====
            elif "Western" in astro_system:
                st.markdown("### Western Birth Chart (Tropical)")

                col_w1, col_w2 = st.columns(2)
                with col_w1:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center;">
                        <div style="font-size: 3rem;">{sun_sign_western['symbol']}</div>
                        <div style="color: #fbbf24;"><b>Sun Sign</b></div>
                        <div style="font-size: 1.5rem;">{sun_sign_western['name']}</div>
                        <div style="color: #9ca3af;">{sun_sign_western['element']} • {sun_sign_western['quality']}</div>
                        <div style="color: #9ca3af; font-size: 0.9rem;">Ruled by: {sun_sign_western['ruler']}</div>
                        <div style="color: #a78bfa; font-size: 0.8rem;">{birth_positions['Sun']['degree_in_sign']:.1f}°</div>
                    </div>
                    """, unsafe_allow_html=True)

                with col_w2:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center;">
                        <div style="font-size: 3rem;">{moon_sign_western['symbol']}</div>
                        <div style="color: #c0c0c0;"><b>Moon Sign</b></div>
                        <div style="font-size: 1.5rem;">{moon_sign_western['name']}</div>
                        <div style="color: #9ca3af;">{moon_sign_western['element']} • {moon_sign_western['quality']}</div>
                        <div style="color: #9ca3af; font-size: 0.9rem;">Ruled by: {moon_sign_western['ruler']}</div>
                        <div style="color: #a78bfa; font-size: 0.8rem;">{birth_positions['Moon']['degree_in_sign']:.1f}°</div>
                    </div>
                    """, unsafe_allow_html=True)

                # Element balance
                st.markdown("---")
                st.markdown("#### Elemental Balance")
                elements = {"Fire": 0, "Earth": 0, "Air": 0, "Water": 0}
                for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]:
                    element = birth_positions[planet]["sign"]["element"]
                    elements[element] += 1

                elem_cols = st.columns(4)
                emoji_map = {"Fire": "🔥", "Earth": "🌍", "Air": "💨", "Water": "💧"}
                for i, (elem, count) in enumerate(elements.items()):
                    with elem_cols[i]:
                        st.metric(f"{emoji_map[elem]} {elem}", f"{count} planets")

                # Western planet table
                st.markdown("---")
                st.markdown("#### Planetary Positions (Tropical)")
                western_table = []
                for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]:
                    pos = birth_positions[planet]
                    western_table.append({
                        "Planet": f"{PLANETS[planet]['symbol']} {planet}",
                        "Sign": f"{pos['sign']['symbol']} {pos['sign']['name']}",
                        "Degree": f"{pos['degree_in_sign']:.2f}°",
                        "Element": pos['sign']['element'],
                        "Quality": pos['sign']['quality']
                    })
                st.dataframe(pd.DataFrame(western_table), use_container_width=True, hide_index=True)

            # ===== COMPARE ALL VIEW =====
            else:
                st.markdown("### Compare: Science vs Vedic vs Western")
                st.caption("See how the same celestial positions are interpreted differently")

                # Summary comparison cards
                st.markdown("#### Sun & Moon at a Glance")
                col_c1, col_c2, col_c3 = st.columns(3)

                with col_c1:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center; border-top: 3px solid #3b82f6;">
                        <div style="color: #3b82f6;"><b>🔭 SCIENCE</b></div>
                        <div style="font-size: 0.8rem; color: #9ca3af; margin-bottom: 0.5rem;">Astronomical Positions</div>
                        <div><b>☀️ Sun:</b> {birth_positions['Sun']['tropical']:.2f}° ecliptic</div>
                        <div><b>🌙 Moon:</b> {birth_positions['Moon']['tropical']:.2f}° ecliptic</div>
                        <div style="color: #9ca3af; font-size: 0.8rem; margin-top: 0.5rem;">No interpretations - just data</div>
                    </div>
                    """, unsafe_allow_html=True)

                with col_c2:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center; border-top: 3px solid #f59e0b;">
                        <div style="color: #f59e0b;"><b>🕉️ VEDIC (Sidereal)</b></div>
                        <div style="font-size: 0.8rem; color: #9ca3af; margin-bottom: 0.5rem;">Based on fixed stars</div>
                        <div><b>☀️ Surya:</b> {sun_rashi['symbol']} {sun_rashi['name']}</div>
                        <div><b>🌙 Chandra:</b> {moon_rashi['symbol']} {moon_rashi['name']}</div>
                        <div><b>⭐ Nakshatra:</b> {nakshatra['name']}</div>
                    </div>
                    """, unsafe_allow_html=True)

                with col_c3:
                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center; border-top: 3px solid #a855f7;">
                        <div style="color: #a855f7;"><b>🔮 WESTERN (Tropical)</b></div>
                        <div style="font-size: 0.8rem; color: #9ca3af; margin-bottom: 0.5rem;">Based on seasons</div>
                        <div><b>☀️ Sun:</b> {sun_sign_western['symbol']} {sun_sign_western['name']}</div>
                        <div><b>🌙 Moon:</b> {moon_sign_western['symbol']} {moon_sign_western['name']}</div>
                        <div><b>Element:</b> {sun_sign_western['element']}</div>
                    </div>
                    """, unsafe_allow_html=True)

                # Detailed comparison table
                st.markdown("---")
                st.markdown("#### Complete Planetary Comparison")

                compare_table = []
                for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]:
                    pos = birth_positions[planet]
                    compare_table.append({
                        "Planet": f"{PLANETS[planet]['symbol']} {planet}",
                        "Ecliptic (°)": f"{pos['tropical']:.2f}°",
                        "Vedic Rashi": f"{pos['rashi']['symbol']} {pos['rashi']['name']}",
                        "Western Sign": f"{pos['sign']['symbol']} {pos['sign']['name']}",
                        "Same?": "✅" if pos['rashi']['english'] == pos['sign']['name'] else "❌"
                    })
                st.dataframe(pd.DataFrame(compare_table), use_container_width=True, hide_index=True)

                # Explanation of differences
                st.markdown("---")
                st.markdown("#### Why Are They Different?")

                st.markdown(f"""
                <div class="cosmic-card">
                    <h4>The ~{birth_positions['ayanamsa']:.1f}° Difference Explained</h4>

                    <p><b>The Precession of Equinoxes:</b> Earth wobbles like a spinning top, completing one cycle every ~26,000 years.
                    This causes the position of the Vernal Equinox (0° Aries in Western astrology) to slowly drift backward through the constellations.</p>

                    <p><b>Western Astrology (Tropical):</b> Uses the Vernal Equinox as 0° Aries, tied to Earth's seasons.
                    When you're born during spring equinox, your Sun is at 0° Aries - regardless of which constellation is actually behind it.</p>

                    <p><b>Vedic Astrology (Sidereal):</b> Uses the actual star positions. The Lahiri Ayanamsa ({birth_positions['ayanamsa']:.2f}°)
                    is the correction applied to convert tropical to sidereal positions.</p>

                    <p><b>Science:</b> Uses the same tropical (seasonal) measurement as Western, but draws no astrological conclusions.
                    Astronomy treats constellations as arbitrary star patterns with no influence on human affairs.</p>
                </div>
                """, unsafe_allow_html=True)

                col_exp1, col_exp2 = st.columns(2)
                with col_exp1:
                    st.markdown("""
                    <div class="cosmic-card">
                        <h4>🕉️ Vedic Philosophy</h4>
                        <ul>
                            <li><b>Origin:</b> Ancient India (~3000+ years)</li>
                            <li><b>Focus:</b> Karma, dharma, spiritual growth</li>
                            <li><b>Key Feature:</b> Uses Nakshatras (27 lunar mansions)</li>
                            <li><b>Moon Emphasis:</b> Chandra Rashi is primary</li>
                            <li><b>Dasha System:</b> Planetary periods for timing</li>
                        </ul>
                    </div>
                    """, unsafe_allow_html=True)

                with col_exp2:
                    st.markdown("""
                    <div class="cosmic-card">
                        <h4>🔮 Western Philosophy</h4>
                        <ul>
                            <li><b>Origin:</b> Ancient Greece/Babylon (~2000+ years)</li>
                            <li><b>Focus:</b> Psychology, personality, free will</li>
                            <li><b>Key Feature:</b> Houses, aspects, transits</li>
                            <li><b>Sun Emphasis:</b> Sun Sign is primary</li>
                            <li><b>Modern:</b> Evolved with psychology (Jung)</li>
                        </ul>
                    </div>
                    """, unsafe_allow_html=True)

            # ===== NUMEROLOGY SECTION =====
            st.markdown("---")
            st.markdown("### Your Cosmic Numbers")

            col_n1, col_n2 = st.columns(2)
            with col_n1:
                st.markdown(f"""
                <div class="cosmic-card">
                    <h3 style="text-align: center;">Life Path Number</h3>
                    <div style="text-align: center; font-size: 3rem; color: #a78bfa;">{life_path}</div>
                    <div><b>Ruling Planet:</b> {life_meaning['planet']}</div>
                    <div><b>Key Traits:</b> {life_meaning['traits']}</div>
                    <div><b>Lucky Color:</b> {life_meaning['color']}</div>
                    <div><b>Power Day:</b> {life_meaning['day']}</div>
                </div>
                """, unsafe_allow_html=True)

            with col_n2:
                st.markdown(f"""
                <div class="cosmic-card">
                    <h3 style="text-align: center;">Name Number</h3>
                    <div style="text-align: center; font-size: 3rem; color: #fbbf24;">{name_number}</div>
                    <div><b>Ruling Planet:</b> {name_meaning['planet']}</div>
                    <div><b>Expression:</b> {name_meaning['traits']}</div>
                    <div><b>Resonant Color:</b> {name_meaning['color']}</div>
                    <div><b>Power Day:</b> {name_meaning['day']}</div>
                </div>
                """, unsafe_allow_html=True)

            # ===== ALL PLANETS SECTION =====
            st.markdown("---")
            with st.expander("🪐 View Complete Planetary Positions", expanded=False):
                st.caption(f"📍 {birth_place} | Timezone: UTC{'+' if tz_offset >= 0 else ''}{tz_offset} | Ayanamsa: {birth_positions['ayanamsa']:.2f}°")

                full_table = []
                for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"]:
                    pos = birth_positions[planet]
                    full_table.append({
                        "Planet": f"{PLANETS[planet]['symbol']} {planet}",
                        "Tropical °": f"{pos['tropical']:.2f}°",
                        "Sidereal °": f"{pos['sidereal']:.2f}°",
                        "Western": f"{pos['sign']['name']}",
                        "Vedic": f"{pos['rashi']['name']}",
                    })
                st.dataframe(pd.DataFrame(full_table), use_container_width=True, hide_index=True)

                # Verification info
                with st.expander("🔍 Calculation Details (for verification)"):
                    moon_pos = birth_positions["Moon"]
                    st.markdown(f"""
                    **Moon Position Details:**
                    - Tropical Longitude: {moon_pos['tropical']:.4f}°
                    - Sidereal Longitude: {moon_pos['sidereal']:.4f}°
                    - Western Sign: {moon_pos['sign']['name']} ({moon_pos['degree_in_sign']:.2f}°)
                    - Vedic Rashi: {moon_pos['rashi']['name']} ({moon_pos['degree_in_rashi']:.2f}°)
                    - Nakshatra: {moon_pos['nakshatra']['name']} (Pada {moon_pos['pada']})

                    **Rashi Boundaries (Sidereal):**
                    - Dhanu (Sagittarius): 240° - 270°
                    - Makara (Capricorn): 270° - 300°

                    **Purva Ashadha (Pooradam) Nakshatra:**
                    - Range: 253.33° - 266.67° (sidereal)
                    """)

            # Share section
            st.markdown("---")
            st.subheader("📤 Share Your Cosmic Profile")

            share_text = f"""✨ My Cosmic Birth Chart ✨

🕉️ Vedic/Jyotish:
🌞 Surya Rashi: {sun_rashi['name']} ({sun_rashi['english']}) {sun_rashi['symbol']}
🌙 Chandra Rashi: {moon_rashi['name']} ({moon_rashi['english']}) {moon_rashi['symbol']}
⭐ Nakshatra: {nakshatra['name']} (Pada {pada})

🔮 Western:
☉ Sun: {sun_sign_western['name']} | ☽ Moon: {moon_sign_western['name']}

🔢 Life Path: {life_path}

Born under the stars in {birth_place}
#AstroData #Jyotish #VedicAstrology"""

            st.text_area("Copy & Share:", value=share_text, height=180)

            # Social share buttons
            encoded_text = share_text.replace('\n', '%0A').replace(' ', '%20').replace('#', '%23')
            col_s1, col_s2, col_s3 = st.columns(3)
            with col_s1:
                st.markdown(f'<a href="https://twitter.com/intent/tweet?text={encoded_text}" target="_blank"><button style="background: #1DA1F2; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Share on X/Twitter</button></a>', unsafe_allow_html=True)
            with col_s2:
                st.markdown(f'<a href="https://www.facebook.com/sharer/sharer.php?quote={encoded_text}" target="_blank"><button style="background: #4267B2; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Share on Facebook</button></a>', unsafe_allow_html=True)
            with col_s3:
                st.markdown(f'<a href="https://wa.me/?text={encoded_text}" target="_blank"><button style="background: #25D366; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Share on WhatsApp</button></a>', unsafe_allow_html=True)

        else:
            st.info("👆 Enter your name to generate your personalized cosmic birth chart!")


# ============== RETROGRADE TRACKER PAGE ==============

elif page == "🔄 Retrograde Tracker":
    st.header("🔄 Planetary Retrograde Tracker")
    st.markdown("**Track when planets appear to move backward and their cosmic influence**")

    # Current retrogrades
    current_retros = get_current_retrograde_planets()
    upcoming_retros = get_upcoming_retrogrades(limit=6)

    col1, col2 = st.columns([1, 1])

    with col1:
        st.subheader("Currently Retrograde")

        if current_retros:
            for retro in current_retros:
                planet_info = PLANETS[retro["planet"]]
                st.markdown(f"""
                <div class="cosmic-card" style="border-left: 4px solid {planet_info['color']};">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 2rem;">{planet_info['symbol']}</span>
                        <div>
                            <div style="font-size: 1.3rem;"><b>{retro['planet']} Retrograde</b></div>
                            <div style="color: #f59e0b;">in {retro['sign']}</div>
                            <div style="color: #9ca3af;">{retro['days_left']} days remaining</div>
                            <div style="color: #9ca3af; font-size: 0.8rem;">{retro['start'].strftime('%b %d')} - {retro['end'].strftime('%b %d, %Y')}</div>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
        else:
            st.markdown("""
            <div class="cosmic-card" style="text-align: center;">
                <div style="font-size: 2rem;">✨</div>
                <div>No major planets currently retrograde!</div>
                <div style="color: #22c55e;">Clear cosmic sailing ahead</div>
            </div>
            """, unsafe_allow_html=True)

    with col2:
        st.subheader("Upcoming Retrogrades")

        for retro in upcoming_retros:
            planet_info = PLANETS[retro["planet"]]
            st.markdown(f"""
            <div style="background: rgba(99, 102, 241, 0.1); padding: 0.75rem; border-radius: 10px; margin: 0.5rem 0; border-left: 3px solid {planet_info['color']};">
                <span style="font-size: 1.2rem;">{planet_info['symbol']}</span>
                <b>{retro['planet']}</b> in {retro['sign']}<br>
                <span style="color: #9ca3af;">Starts in {retro['days_until']} days ({retro['start'].strftime('%b %d, %Y')})</span>
            </div>
            """, unsafe_allow_html=True)

    # Retrograde explanations
    st.markdown("---")
    st.subheader("What Does Retrograde Mean?")

    retrograde_meanings = {
        "Mercury": {"area": "Communication, Technology, Travel", "advice": "Review contracts, backup data, allow extra travel time", "frequency": "3-4 times/year for ~3 weeks"},
        "Venus": {"area": "Love, Relationships, Money, Beauty", "advice": "Reflect on relationships, avoid major purchases, reconnect with past", "frequency": "Once every 18 months for ~6 weeks"},
        "Mars": {"area": "Energy, Action, Conflict, Passion", "advice": "Avoid starting new projects, review strategies, manage anger", "frequency": "Once every 2 years for ~2 months"},
        "Jupiter": {"area": "Growth, Luck, Expansion, Wisdom", "advice": "Internal growth, revisit beliefs, delayed rewards", "frequency": "Once yearly for ~4 months"},
        "Saturn": {"area": "Structure, Karma, Discipline, Time", "advice": "Review responsibilities, karmic lessons, restructure", "frequency": "Once yearly for ~4.5 months"},
    }

    tabs = st.tabs([f"{PLANETS[p]['symbol']} {p}" for p in retrograde_meanings.keys()])
    for i, (planet, meaning) in enumerate(retrograde_meanings.items()):
        with tabs[i]:
            st.markdown(f"""
            <div class="cosmic-card">
                <h3>{PLANETS[planet]['symbol']} {planet} Retrograde</h3>
                <div><b>Areas Affected:</b> {meaning['area']}</div>
                <div><b>Advice:</b> {meaning['advice']}</div>
                <div><b>Frequency:</b> {meaning['frequency']}</div>
            </div>
            """, unsafe_allow_html=True)

    # Personalized retrograde impact
    if profile_name != "Cosmic Explorer":
        st.markdown("---")
        st.subheader(f"🎯 Personal Impact for {profile_name}")

        birth_positions = get_all_planetary_positions(datetime.combine(profile_birth_date, profile_birth_time), user_lat, user_lon)
        sun_sign = birth_positions["Sun"]["sign"]["name"]

        st.markdown(f"""
        <div class="cosmic-card">
            <p>As a <b>{sun_sign}</b>, here's how current retrogrades may affect you:</p>
            <ul>
                <li>Mercury retrograde especially impacts communication for {sun_sign} natives</li>
                <li>Your ruling planet's retrograde is particularly significant</li>
                <li>Track transits to your natal planets for deeper insights</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)


# ============== COSMIC WEATHER PAGE ==============

elif page == "⛅ Cosmic Weather":
    st.header("⛅ Today's Cosmic Weather")
    st.markdown("**Your daily celestial forecast based on planetary positions**")

    today = datetime.now()
    today_positions = get_all_planetary_positions(today, user_lat, user_lon)

    # Daily overview
    col1, col2, col3 = st.columns(3)

    with col1:
        moon_phase = today_positions["moon_phase"]["phase"]
        st.markdown(f"""
        <div class="cosmic-card" style="text-align: center;">
            <div style="font-size: 3rem;">{moon_phase['emoji']}</div>
            <div style="color: #a78bfa;"><b>{moon_phase['name']}</b></div>
            <div style="color: #9ca3af;">{today_positions['moon_phase']['illumination']:.0f}% illuminated</div>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        p_hour = today_positions["planetary_hour"]
        st.markdown(f"""
        <div class="cosmic-card" style="text-align: center;">
            <div style="font-size: 2rem;">{PLANETS[p_hour['ruler']]['symbol']}</div>
            <div style="color: #fbbf24;"><b>{p_hour['ruler']} Hour</b></div>
            <div style="color: #9ca3af;">Day of {p_hour['day_ruler']}</div>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        # Random cosmic fact for the day (based on day of year)
        fact_index = today.timetuple().tm_yday % len(COSMIC_FACTS)
        st.markdown(f"""
        <div class="cosmic-card" style="text-align: center;">
            <div style="font-size: 2rem;">💫</div>
            <div style="color: #22c55e;"><b>Cosmic Fact</b></div>
            <div style="color: #9ca3af; font-size: 0.85rem;">{COSMIC_FACTS[fact_index]}</div>
        </div>
        """, unsafe_allow_html=True)

    # Tithi and Nakshatra
    st.markdown("---")
    st.subheader("Vedic Day Markers")

    col_v1, col_v2, col_v3 = st.columns(3)
    with col_v1:
        st.metric("Tithi", today_positions["tithi"]["name"])
    with col_v2:
        st.metric("Nakshatra", today_positions["Moon"]["nakshatra"]["name"])
    with col_v3:
        weekday_names = ["Somvar (Moon)", "Mangalvar (Mars)", "Budhvar (Mercury)",
                        "Guruvar (Jupiter)", "Shukravar (Venus)", "Shanivar (Saturn)", "Ravivar (Sun)"]
        st.metric("Vara", weekday_names[today.weekday()])

    # Active retrogrades
    current_retros = get_current_retrograde_planets()
    if current_retros:
        st.markdown("---")
        st.subheader("⚠️ Active Retrogrades")
        retro_cols = st.columns(len(current_retros))
        for i, retro in enumerate(current_retros):
            with retro_cols[i]:
                st.markdown(f"""
                <div class="cosmic-card" style="text-align: center; background: rgba(239, 68, 68, 0.1);">
                    <div style="font-size: 1.5rem;">{PLANETS[retro['planet']]['symbol']}</div>
                    <div><b>{retro['planet']} Rx</b></div>
                    <div style="color: #9ca3af;">{retro['days_left']} days left</div>
                </div>
                """, unsafe_allow_html=True)

    # Personal forecast
    st.markdown("---")
    st.subheader("🌟 Your Personal Cosmic Weather")

    if profile_name != "Cosmic Explorer":
        birth_positions = get_all_planetary_positions(datetime.combine(profile_birth_date, profile_birth_time), user_lat, user_lon)
        sun_sign = birth_positions["Sun"]["sign"]
        moon_sign = birth_positions["Moon"]["sign"]
        life_path = calculate_life_path_number(profile_birth_date)

        # Generate personalized message
        moon_advice = {
            "New Moon": "Perfect time for new beginnings and setting intentions",
            "Waxing Crescent": "Build momentum, take small steps toward goals",
            "First Quarter": "Time for action and overcoming obstacles",
            "Waxing Gibbous": "Refine your approach, almost there",
            "Full Moon": "Culmination, celebration, release what doesn't serve you",
            "Waning Gibbous": "Share wisdom, express gratitude",
            "Last Quarter": "Let go, forgive, prepare for renewal",
            "Waning Crescent": "Rest, reflect, dream",
        }

        today_moon = today_positions["Moon"]["sign"]["name"]
        st.markdown(f"""
        <div class="cosmic-card">
            <h3>Hello, {profile_name}! ✨</h3>
            <p><b>Your Sun ({sun_sign['name']}) meets today's Moon ({today_moon}):</b></p>
            <p>{moon_advice.get(moon_phase['name'], 'Stay aligned with cosmic flow')}</p>
            <p><b>Life Path {life_path} Energy Today:</b> {BIRTH_NUMBER_MEANINGS[life_path]['traits']}</p>
        </div>
        """, unsafe_allow_html=True)

        # Shareable daily horoscope
        st.markdown("---")
        st.subheader("📤 Share Today's Cosmic Weather")

        share_weather = f"""⛅ My Cosmic Weather for {today.strftime('%B %d, %Y')}

{moon_phase['emoji']} Moon: {moon_phase['name']}
✨ Nakshatra: {today_positions['Moon']['nakshatra']['name']}
🌙 Tithi: {today_positions['tithi']['name']}

My Sign: {sun_sign['name']} {sun_sign['symbol']}
Energy: {moon_advice.get(moon_phase['name'], 'Flow with the cosmos')}

#CosmicWeather #AstroData #DailyHoroscope"""

        st.text_area("Copy & Share:", value=share_weather, height=200)
    else:
        st.info("💡 Enter your details in the sidebar to get personalized cosmic weather!")


# ============== STAR STORIES PAGE ==============

elif page == "🌟 Star Stories":
    st.header("🌟 Star Stories & Mythology")
    st.markdown("**Discover the ancient tales written in the stars across cultures**")

    # Select a star/constellation
    selected_star = st.selectbox(
        "Choose a celestial object:",
        list(STAR_MYTHOLOGY.keys()),
        format_func=lambda x: f"⭐ {x}"
    )

    star_data = STAR_MYTHOLOGY[selected_star]

    # Display star info
    st.markdown(f"""
    <div class="cosmic-card">
        <h2 style="text-align: center; color: #fbbf24;">⭐ {selected_star}</h2>
        <div style="text-align: center; color: #9ca3af;">
            Known across: {', '.join(star_data['cultures'])}
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Stories from different cultures
    st.subheader("Stories Across Cultures")

    culture_cols = st.columns(2)
    col_index = 0

    culture_emojis = {"greek": "🏛️", "hindu": "🕉️", "chinese": "🏮", "egyptian": "🏺",
                     "japanese": "🎌", "arabic": "🌙", "norse": "⚔️"}

    for culture in ["greek", "hindu", "chinese", "egyptian", "japanese", "arabic"]:
        if culture in star_data:
            with culture_cols[col_index % 2]:
                emoji = culture_emojis.get(culture, "📖")
                st.markdown(f"""
                <div class="cosmic-card">
                    <h4>{emoji} {culture.title()} Tradition</h4>
                    <p>{star_data[culture]}</p>
                </div>
                """, unsafe_allow_html=True)
            col_index += 1

    # Scientific fact
    if "fact" in star_data:
        st.markdown("---")
        st.markdown(f"""
        <div class="cosmic-card" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3);">
            <h4>🔬 Scientific Fact</h4>
            <p>{star_data['fact']}</p>
        </div>
        """, unsafe_allow_html=True)

    # Personal connection
    st.markdown("---")
    st.subheader("🔗 Your Connection to the Stars")

    if profile_name != "Cosmic Explorer":
        birth_positions = get_all_planetary_positions(datetime.combine(profile_birth_date, profile_birth_time), user_lat, user_lon)
        nakshatra = birth_positions["Moon"]["nakshatra"]["name"]

        st.markdown(f"""
        <div class="cosmic-card">
            <h3>{profile_name}'s Stellar Connection</h3>
            <p>Born under <b>{nakshatra}</b> nakshatra, you carry the energy of ancient starlight.</p>
            <p>The stars visible on your birthday from {user_name} have been guiding humanity for millennia.</p>
            <p>Light that left {selected_star} years ago is still reaching Earth today - a cosmic message through time!</p>
        </div>
        """, unsafe_allow_html=True)

        # Share star connection
        share_star = f"""🌟 My Star Story Connection

⭐ Exploring: {selected_star}
🌙 My Nakshatra: {nakshatra}
📍 Viewing from: {user_name}

The same stars that guided ancient civilizations shine on me today.

#StarStories #AstroData #CosmicConnection"""

        st.text_area("Share Your Star Connection:", value=share_star, height=150)
    else:
        st.info("💡 Enter your details in the sidebar to discover your personal star connection!")

    # All stars quick view
    st.markdown("---")
    st.subheader("Quick Star Guide")

    star_cols = st.columns(3)
    for i, (star, data) in enumerate(STAR_MYTHOLOGY.items()):
        with star_cols[i % 3]:
            st.markdown(f"""
            <div style="background: rgba(99, 102, 241, 0.1); padding: 0.75rem; border-radius: 10px; margin: 0.5rem 0;">
                <b>⭐ {star}</b><br>
                <span style="color: #9ca3af; font-size: 0.8rem;">{len(data['cultures'])} cultural traditions</span>
            </div>
            """, unsafe_allow_html=True)


# ============== REST OF THE PAGES (same as before, using user_lat, user_lon, user_name) ==============

elif page == "🕰️ Cosmic Time Machine":
    st.header("🕰️ Cosmic Time Machine")
    st.markdown("**What did the sky look like on the most important days in history?**")

    col1, col2 = st.columns([1, 2])

    with col1:
        time_choice = st.radio("Choose:", ["Historical Event", "My Birthday", "Custom Date"])

        if time_choice == "Historical Event":
            event = st.selectbox("Select event:", list(HISTORICAL_EVENTS.keys()))
            selected_date = HISTORICAL_EVENTS[event]["date"]
            st.info(f"📅 {selected_date.strftime('%B %d, %Y')}")
        elif time_choice == "My Birthday":
            selected_date = st.date_input("Your birthday:", value=date(2000, 1, 1))
        else:
            selected_date = st.date_input("Pick any date:", value=date(1969, 7, 20))

        st.markdown(f"**📍 Viewing from:** {user_name}")

    with col2:
        st.subheader(f"The Sky on {selected_date.strftime('%B %d, %Y')}")

        st.markdown(f"""
        <div class="cosmic-card">
        <p class="insight-text">
        On this night in <b>{user_name}</b>...<br><br>
        The light from <b>Sirius</b> (8.6 ly away) reaching Earth that night
        left the star in <b>{int(selected_date.year - 8.6)}</b>.<br><br>
        The light from <b>Andromeda Galaxy</b> began its journey <b>2.5 million years ago</b>!
        </p>
        </div>
        """, unsafe_allow_html=True)

        # Visible objects
        visible = []
        for key, obj in DEEP_SKY_OBJECTS.items():
            alt = calculate_altitude(obj["dec"], user_lat)
            if alt > 10:
                _, era = get_light_travel_events(obj["distance_ly"])
                visible.append({"Object": obj["name"], "Type": obj["type"], "Light Left": era})

        if visible:
            st.dataframe(pd.DataFrame(visible), use_container_width=True, hide_index=True)


elif page == "⭐ Your Cosmic Twin":
    st.header("⭐ Find Your Cosmic Twin Star")
    st.markdown("**Discover the star whose light left when YOU were born!**")

    col1, col2 = st.columns([1, 2])

    with col1:
        birth_year = st.number_input("Birth Year:", min_value=1920, max_value=datetime.now().year, value=2000)
        your_age = datetime.now().year - birth_year
        st.markdown(f"### You are **{your_age}** years old")

    with col2:
        st.markdown(f"""
        <div class="cosmic-card">
        <p class="insight-text">
        You are cosmically connected to stars <b>{your_age} light-years</b> away!<br><br>
        The light reaching Earth today from those stars left when you were <b>being born</b>.
        </p>
        </div>
        """, unsafe_allow_html=True)

        twins = find_cosmic_twin_star(birth_year)
        if twins:
            st.markdown("### 🌟 Your Cosmic Twin Stars")
            for star in twins:
                st.markdown(f"**{star['name']}** in {star['constellation']} - {star['distance_ly']} light-years")
        else:
            closest = min(STARS_WITH_AGES, key=lambda s: abs(s["distance_ly"] - your_age))
            st.markdown(f"### 🌟 Your Closest Cosmic Connection: **{closest['name']}**")


elif page == "🌍 Shared Sky":
    st.header("🌍 The Shared Sky")
    st.markdown(f"**Who else can see what you see from {user_name}?**")

    col1, col2 = st.columns([1, 2])

    with col1:
        selected_obj = st.selectbox(
            "Choose what to observe:",
            list(DEEP_SKY_OBJECTS.keys()),
            format_func=lambda x: DEEP_SKY_OBJECTS[x]["name"]
        )
        obj = DEEP_SKY_OBJECTS[selected_obj]
        your_alt = calculate_altitude(obj["dec"], user_lat)

        if your_alt > 15:
            st.success(f"✓ Visible from {user_name}! (Alt: {your_alt:.0f}°)")
        else:
            st.warning(f"✗ Not well-visible from your location")

    with col2:
        st.subheader(f"Who Else Can See {obj['name']}?")

        shared = []
        for k, loc in LOCATIONS.items():
            alt = calculate_altitude(obj["dec"], loc["lat"])
            if alt > 15:
                shared.append({"City": loc["name"], "Country": loc["country"], "Altitude": f"{alt:.0f}°"})

        if shared:
            st.markdown(f"**{len(shared)} locations** can see this object!")
            st.dataframe(pd.DataFrame(shared[:20]), use_container_width=True, hide_index=True)
            if len(shared) > 20:
                st.caption(f"... and {len(shared) - 20} more locations")


elif page == "✉️ Cosmic Postcard":
    st.header("✉️ Send a Cosmic Postcard")
    st.markdown("**When would your message arrive at the speed of light?**")

    col1, col2 = st.columns([1, 2])

    with col1:
        message = st.text_area("Your message:", "Hello from Earth!")
        sender_name = st.text_input("Your name:", "A Curious Student")
        sender_age = st.number_input("Your age:", min_value=5, max_value=100, value=15)

    with col2:
        st.markdown(f"""
        <div class="cosmic-card">
        <p style="font-style: italic;">"{message}"<br>— {sender_name}, {user_name}</p>
        </div>
        """, unsafe_allow_html=True)

        destinations = [
            ("The Moon", 1.3, "seconds"),
            ("Mars", 3, "minutes"),
            ("Proxima b", 4.24, "years"),
            ("TRAPPIST-1", 39, "years"),
            ("Andromeda", 2537000, "years"),
        ]

        st.markdown("### When Your Message Arrives:")
        for dest, dist, unit in destinations:
            if unit == "years":
                arrival_age = sender_age + dist
                st.markdown(f"**{dest}** — {dist:,} {unit} (You'll be {arrival_age:,.0f} years old)")
            else:
                st.markdown(f"**{dest}** — {dist} {unit}")


elif page == "🔭 Light's Journey":
    st.header("🔭 Follow the Light's Journey")
    st.markdown("**What was happening on Earth when this light left?**")

    col1, col2 = st.columns([1, 2])

    with col1:
        selected_obj = st.selectbox(
            "What are you looking at?",
            list(DEEP_SKY_OBJECTS.keys()),
            format_func=lambda x: f"{DEEP_SKY_OBJECTS[x]['name']} ({DEEP_SKY_OBJECTS[x]['distance_ly']:,} ly)"
        )
        obj = DEEP_SKY_OBJECTS[selected_obj]
        st.metric("Distance", f"{obj['distance_ly']:,} light-years")

    with col2:
        light_year, era = get_light_travel_events(obj["distance_ly"])
        st.markdown(f"""
        <div class="cosmic-card">
        <p class="insight-text">
        The light entering your eyes <b>right now</b> from {obj['name']}
        began its journey <b>{obj['distance_ly']:,} years ago</b>.<br><br>
        When this light left, on Earth it was: <b>{era}</b>!
        </p>
        </div>
        """, unsafe_allow_html=True)


elif page == "🪐 Exoplanet Explorer":
    st.header("🪐 Potentially Habitable Worlds")

    col1, col2 = st.columns([1, 2])

    with col1:
        selected_planet = st.selectbox("Choose an exoplanet:", [p["name"] for p in EXOPLANETS])
        planet = next(p for p in EXOPLANETS if p["name"] == selected_planet)
        st.metric("Distance", f"{planet['distance_ly']} light-years")
        st.metric("Discovered", planet["year"])

    with col2:
        st.markdown(f"""
        <div class="cosmic-card">
        <p class="insight-text">
        If intelligent beings exist on <b>{planet['name']}</b>...<br><br>
        📡 A message we send today arrives in <b>{datetime.now().year + planet['distance_ly']:.0f}</b><br>
        📨 Their reply reaches us in <b>{datetime.now().year + 2*planet['distance_ly']:.0f}</b><br>
        ⏱️ Total conversation time: <b>{2*planet['distance_ly']:.0f} years</b>!
        </p>
        </div>
        """, unsafe_allow_html=True)


# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; padding: 2rem;">
    <div style="margin-bottom: 1rem;">
        <span style="font-size: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">✦</span>
    </div>
    <h3 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem;">AstroData</h3>
    <p style="color: #9ca3af; margin-bottom: 1rem;">Democratizing Space Education Worldwide</p>
    <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-bottom: 1rem;">
        <span style="color: #a78bfa;">✨ 150+ Locations</span>
        <span style="color: #f59e0b;">🔮 Western & Vedic</span>
        <span style="color: #22c55e;">📊 Real-time Data</span>
    </div>
    <p style="color: #6b7280; font-size: 0.8rem;">For curious minds, astronomy learners, and astrologers</p>
    <div style="margin-top: 1.5rem; display: flex; justify-content: center; gap: 1rem;">
        <a href="#" style="color: #9ca3af; text-decoration: none;">About</a>
        <span style="color: #4b5563;">•</span>
        <a href="#" style="color: #9ca3af; text-decoration: none;">Privacy</a>
        <span style="color: #4b5563;">•</span>
        <a href="#" style="color: #9ca3af; text-decoration: none;">Contact</a>
    </div>
    <p style="color: #4b5563; font-size: 0.7rem; margin-top: 1rem;">Made with ✨ for cosmic explorers everywhere</p>
</div>
""", unsafe_allow_html=True)
