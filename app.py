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

# Auth and Premium Features
AUTH_AVAILABLE = False
AUTH_ERROR = None
try:
    from auth import (
        init_auth_state, render_auth_ui, is_logged_in, is_pro_user,
        get_current_user, feature_gate, render_signin_modal, render_upgrade_modal
    )
    from config import get_config
    AUTH_AVAILABLE = True
except Exception as e:
    AUTH_ERROR = str(e)


def check_pro_feature(feature_name: str, show_prompt: bool = True) -> bool:
    """
    Check if user has access to a premium feature.
    Returns True if user has access (is Pro or auth not configured).
    If auth is not configured, all features are available.
    """
    if not AUTH_AVAILABLE:
        return True  # If auth not configured, all features are free

    return feature_gate(feature_name, show_prompt)

# Set page config
st.set_page_config(
    page_title="AstroData | Cosmic Explorer",
    page_icon="🅰️",
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
                --card-title: #ffffff;
                --card-desc: #9ca3af;
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
                --card-title: #190c00;
                --card-desc: #5a4a3a;
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
            /* Light mode overrides for inline styles */
            [style*="color: #ffffff"], [style*="color:#ffffff"] { color: #190c00 !important; }
            [style*="color: #9ca3af"], [style*="color:#9ca3af"] { color: #5a4a3a !important; }
            [style*="color: #e5e7eb"], [style*="color:#e5e7eb"] { color: #3a3a3a !important; }
            [style*="color: #d1d5db"], [style*="color:#d1d5db"] { color: #4a4a4a !important; }
            [style*="color: #6b7280"], [style*="color:#6b7280"] { color: #5a4a3a !important; }
            [style*="color: #4b5563"], [style*="color:#4b5563"] { color: #6a5a4a !important; }
            [style*="color: #fbbf24"], [style*="color:#fbbf24"] { color: #b88a10 !important; }
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
    # Space Exploration Milestones
    "Moon Landing (Apollo 11)": {"date": date(1969, 7, 20), "desc": "Neil Armstrong and Buzz Aldrin walk on the Moon", "category": "Space"},
    "First Human in Space (Gagarin)": {"date": date(1961, 4, 12), "desc": "Yuri Gagarin orbits Earth aboard Vostok 1", "category": "Space"},
    "First Spacewalk (Leonov)": {"date": date(1965, 3, 18), "desc": "Alexei Leonov performs first spacewalk", "category": "Space"},
    "Sputnik 1 Launch": {"date": date(1957, 10, 4), "desc": "First artificial satellite launched", "category": "Space"},
    "Hubble Launch": {"date": date(1990, 4, 24), "desc": "Hubble Space Telescope deployed", "category": "Space"},
    "First Exoplanet Confirmed": {"date": date(1995, 10, 6), "desc": "51 Pegasi b discovered - first exoplanet around Sun-like star", "category": "Space"},
    "JWST Launch": {"date": date(2021, 12, 25), "desc": "James Webb Space Telescope launched", "category": "Space"},
    "Mars Rover Curiosity Landing": {"date": date(2012, 8, 6), "desc": "Curiosity rover lands on Mars", "category": "Space"},
    "Voyager 1 Interstellar Space": {"date": date(2012, 8, 25), "desc": "Voyager 1 enters interstellar space", "category": "Space"},
    "ISS First Crew": {"date": date(2000, 11, 2), "desc": "First crew arrives at International Space Station", "category": "Space"},
    "SpaceX Crew Dragon First Launch": {"date": date(2020, 5, 30), "desc": "First crewed commercial spaceflight", "category": "Space"},

    # Scientific Discoveries
    "Einstein's Relativity Published": {"date": date(1915, 11, 25), "desc": "General Theory of Relativity presented", "category": "Science"},
    "DNA Structure Discovered": {"date": date(1953, 4, 25), "desc": "Watson & Crick publish DNA double helix structure", "category": "Science"},
    "Higgs Boson Confirmed": {"date": date(2012, 7, 4), "desc": "CERN announces discovery of Higgs Boson", "category": "Science"},
    "First LIGO Gravitational Wave": {"date": date(2015, 9, 14), "desc": "First gravitational wave detected", "category": "Science"},
    "Black Hole First Image": {"date": date(2019, 4, 10), "desc": "Event Horizon Telescope captures M87 black hole", "category": "Science"},

    # World Events
    "World War I Ends": {"date": date(1918, 11, 11), "desc": "Armistice signed ending WWI", "category": "History"},
    "World War II Ends": {"date": date(1945, 9, 2), "desc": "Japan surrenders, ending WWII", "category": "History"},
    "Fall of Berlin Wall": {"date": date(1989, 11, 9), "desc": "Berlin Wall falls", "category": "History"},
    "Indian Independence": {"date": date(1947, 8, 15), "desc": "India gains independence", "category": "History"},
    "First Computer (ENIAC)": {"date": date(1946, 2, 14), "desc": "ENIAC unveiled - first general-purpose computer", "category": "History"},
    "Internet Created (ARPANET)": {"date": date(1969, 10, 29), "desc": "First ARPANET message sent", "category": "History"},

    # Astronomical Events
    "Total Solar Eclipse 2017": {"date": date(2017, 8, 21), "desc": "Great American Eclipse", "category": "Astronomy"},
    "Halley's Comet 1986": {"date": date(1986, 2, 9), "desc": "Halley's Comet closest approach", "category": "Astronomy"},
    "Transit of Venus 2012": {"date": date(2012, 6, 5), "desc": "Last Venus transit until 2117", "category": "Astronomy"},
    "Chelyabinsk Meteor": {"date": date(2013, 2, 15), "desc": "Largest meteor since Tunguska (1908)", "category": "Astronomy"},

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

# Logo as base64 SVG - Modern geometric "A" with space theme
LOGO_BASE64 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgMjAwIj4KICA8ZGVmcz4KICAgIDwhLS0gRGVlcCBzcGFjZSBncmFkaWVudCAtLT4KICAgIDxyYWRpYWxHcmFkaWVudCBpZD0ic3BhY2VHcmFkIiBjeD0iNTAlIiBjeT0iNTAlIiByPSI1MCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWExYTNhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzBhMGExYSIvPgogICAgPC9yYWRpYWxHcmFkaWVudD4KICAgIDwhLS0gTmVidWxhIGdyYWRpZW50IGZvciBtYWluIGVsZW1lbnQgLS0+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9Im5lYnVsYUdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDBkNGZmIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojN2MzYWVkIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2VjNDg5OSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwhLS0gR29sZCBhY2NlbnQgLS0+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImdvbGRHcmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmY2QzNGQiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZjU5ZTBiIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogICAgPCEtLSBCcmlnaHQgc3RhciBnbG93IC0tPgogICAgPGZpbHRlciBpZD0ic3Rhckdsb3ciIHg9Ii0xMDAlIiB5PSItMTAwJSIgd2lkdGg9IjMwMCUiIGhlaWdodD0iMzAwJSI+CiAgICAgIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjMiIHJlc3VsdD0iYmx1ciIvPgogICAgICA8ZmVNZXJnZT4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImJsdXIiLz4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49ImJsdXIiLz4KICAgICAgICA8ZmVNZXJnZU5vZGUgaW49IlNvdXJjZUdyYXBoaWMiLz4KICAgICAgPC9mZU1lcmdlPgogICAgPC9maWx0ZXI+CiAgICA8IS0tIFNvZnQgb3V0ZXIgZ2xvdyAtLT4KICAgIDxmaWx0ZXIgaWQ9InNvZnRHbG93IiB4PSItNTAlIiB5PSItNTAlIiB3aWR0aD0iMjAwJSIgaGVpZ2h0PSIyMDAlIj4KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iNSIgcmVzdWx0PSJibHVyIi8+CiAgICAgIDxmZU1lcmdlPgogICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iYmx1ciIvPgogICAgICAgIDxmZU1lcmdlTm9kZSBpbj0iU291cmNlR3JhcGhpYyIvPgogICAgICA8L2ZlTWVyZ2U+CiAgICA8L2ZpbHRlcj4KICA8L2RlZnM+CgogIDwhLS0gQ2lyY3VsYXIgYmFja2dyb3VuZCAtLT4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijk1IiBmaWxsPSJ1cmwoI3NwYWNlR3JhZCkiLz4KICA8Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9Ijk1IiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjbmVidWxhR3JhZCkiIHN0cm9rZS13aWR0aD0iMiIgb3BhY2l0eT0iMC42Ii8+CgogIDwhLS0gT3JiaXRhbCByaW5ncyAtLT4KICA8ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTAwIiByeD0iODAiIHJ5PSIzMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ1cmwoI25lYnVsYUdyYWQpIiBzdHJva2Utd2lkdGg9IjEuNSIgb3BhY2l0eT0iMC40IiB0cmFuc2Zvcm09InJvdGF0ZSgtMjUsIDEwMCwgMTAwKSIvPgogIDxlbGxpcHNlIGN4PSIxMDAiIGN5PSIxMDAiIHJ4PSI2NSIgcnk9IjI0IiBmaWxsPSJub25lIiBzdHJva2U9InVybCgjbmVidWxhR3JhZCkiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4zIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSwgMTAwLCAxMDApIi8+CgogIDwhLS0gQ2VudHJhbCAiQSIgbGV0dGVyZm9ybSAtIG1vZGVybiBnZW9tZXRyaWMgc3R5bGUgLS0+CiAgPGcgZmlsdGVyPSJ1cmwoI3NvZnRHbG93KSI+CiAgICA8IS0tIE1haW4gdHJpYW5nbGUgc2hhcGUgLS0+CiAgICA8cG9seWdvbiBwb2ludHM9IjEwMCw0NSA2MCwxNDUgNzIsMTQ1IDEwMCw3MiAxMjgsMTQ1IDE0MCwxNDUiIGZpbGw9InVybCgjbmVidWxhR3JhZCkiLz4KICAgIDwhLS0gQ3Jvc3NiYXIgLS0+CiAgICA8cmVjdCB4PSI3NSIgeT0iMTE1IiB3aWR0aD0iNTAiIGhlaWdodD0iMTAiIHJ4PSIzIiBmaWxsPSJ1cmwoI25lYnVsYUdyYWQpIi8+CiAgPC9nPgoKICA8IS0tIE5vcnRoIHN0YXIgYXQgYXBleCAtLT4KICA8ZyBmaWx0ZXI9InVybCgjc3Rhckdsb3cpIj4KICAgIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjQyIiByPSI4IiBmaWxsPSJ1cmwoI2dvbGRHcmFkKSIvPgogICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iNDIiIHI9IjQiIGZpbGw9IiNmZmZmZmYiLz4KICAgIDwhLS0gU3RhciByYXlzIC0tPgogICAgPGxpbmUgeDE9IjEwMCIgeTE9IjMwIiB4Mj0iMTAwIiB5Mj0iMjYiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgIDxsaW5lIHgxPSIxMDAiIHkxPSI1NCIgeDI9IjEwMCIgeTI9IjU4IiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KICAgIDxsaW5lIHgxPSI4OCIgeTE9IjQyIiB4Mj0iODQiIHkyPSI0MiIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgICA8bGluZSB4MT0iMTEyIiB5MT0iNDIiIHgyPSIxMTYiIHkyPSI0MiIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+CiAgPC9nPgoKICA8IS0tIE9yYml0aW5nIHBsYW5ldCAtLT4KICA8Y2lyY2xlIGN4PSIxNjUiIGN5PSI3MCIgcj0iNyIgZmlsbD0idXJsKCNnb2xkR3JhZCkiIGZpbHRlcj0idXJsKCNzdGFyR2xvdykiLz4KICA8Y2lyY2xlIGN4PSIxNjUiIGN5PSI3MCIgcj0iMyIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC44Ii8+CgogIDwhLS0gU2NhdHRlcmVkIHN0YXJzIC0tPgogIDxjaXJjbGUgY3g9IjMwIiBjeT0iNDUiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuOSIvPgogIDxjaXJjbGUgY3g9IjE3MCIgY3k9IjE0NSIgcj0iMS41IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjciLz4KICA8Y2lyY2xlIGN4PSI0NSIgY3k9IjE1NSIgcj0iMS41IiBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIxNTUiIGN5PSIxNjAiIHI9IjIiIGZpbGw9IiNmY2QzNGQiIG9wYWNpdHk9IjAuOCIvPgogIDxjaXJjbGUgY3g9IjM1IiBjeT0iMTAwIiByPSIxIiBmaWxsPSIjMDBkNGZmIiBvcGFjaXR5PSIwLjkiLz4KICA8Y2lyY2xlIGN4PSIxNjUiIGN5PSIxMTAiIHI9IjEiIGZpbGw9IiNlYzQ4OTkiIG9wYWNpdHk9IjAuOSIvPgogIDxjaXJjbGUgY3g9IjUwIiBjeT0iNzAiIHI9IjEuMiIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC42Ii8+CiAgPGNpcmNsZSBjeD0iMTUwIiBjeT0iNTAiIHI9IjEiIGZpbGw9IiNmZmZmZmYiIG9wYWNpdHk9IjAuNyIvPgogIDxjaXJjbGUgY3g9Ijc1IiBjeT0iMTcwIiByPSIxIiBmaWxsPSIjN2MzYWVkIiBvcGFjaXR5PSIwLjgiLz4KICA8Y2lyY2xlIGN4PSIxMjUiIGN5PSIzMCIgcj0iMSIgZmlsbD0iI2ZmZmZmZiIgb3BhY2l0eT0iMC41Ii8+CgogIDwhLS0gU3VidGxlIG5lYnVsYSBjbG91ZHMgLS0+CiAgPGNpcmNsZSBjeD0iNDAiIGN5PSIxNDAiIHI9IjE1IiBmaWxsPSIjN2MzYWVkIiBvcGFjaXR5PSIwLjA4Ii8+CiAgPGNpcmNsZSBjeD0iMTYwIiBjeT0iMTMwIiByPSIxMiIgZmlsbD0iI2VjNDg5OSIgb3BhY2l0eT0iMC4wNiIvPgogIDxjaXJjbGUgY3g9IjU1IiBjeT0iNTUiIHI9IjEwIiBmaWxsPSIjMDBkNGZmIiBvcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPgo="

# Header with Logo and Theme Toggle
col_logo, col_theme = st.columns([4, 1])

with col_logo:
    st.markdown(f"""
    <div class="logo-container">
        <img src="data:image/svg+xml;base64,{LOGO_BASE64}" width="45" style="vertical-align: middle;">
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

# Initialize session state for profile persistence
if "user_display_name" not in st.session_state:
    st.session_state["user_display_name"] = ""
if "birth_date" not in st.session_state:
    st.session_state["birth_date"] = date(2000, 1, 1)
if "birth_time" not in st.session_state:
    st.session_state["birth_time"] = datetime.strptime("12:00", "%H:%M").time()
if "birth_location_key" not in st.session_state:
    st.session_state["birth_location_key"] = "delhi"

# Sidebar with personal profile and location
with st.sidebar:
    # Logo and Branding
    st.markdown(f"""
    <div style="text-align: center; padding: 1rem 0;">
        <img src="data:image/svg+xml;base64,{LOGO_BASE64}" width="100" style="margin-bottom: 0.5rem;">
        <h1 style="margin: 0; font-size: 1.5rem; font-weight: 700; background: linear-gradient(135deg, #6366f1, #0693e3); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">AstroData</h1>
        <p style="margin: 0; font-size: 0.8rem; color: #9ca3af;">Cosmic Explorer</p>
    </div>
    """, unsafe_allow_html=True)

    st.markdown("---")

    # Authentication UI (Pro/Free badge and login)
    if AUTH_AVAILABLE:
        init_auth_state()
        render_auth_ui()
        st.markdown("---")
    elif AUTH_ERROR:
        st.error(f"Auth error: {AUTH_ERROR}")

    # Personal Profile Section
    st.markdown("### 👤 Your Profile")

    # Check if profile is already set
    has_profile = st.session_state.get("user_display_name", "") != ""

    with st.expander("Your Details", expanded=not has_profile):
        user_display_name = st.text_input(
            "Your Name:",
            value=st.session_state.get("user_display_name", ""),
            key="name_input",
            placeholder="Enter your name"
        )
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

        # Birth location
        birth_location_key = st.selectbox(
            "Birth Location:",
            list(LOCATIONS.keys()),
            format_func=lambda x: LOCATIONS[x]["name"],
            index=list(LOCATIONS.keys()).index(st.session_state.get("birth_location_key", "delhi")) if st.session_state.get("birth_location_key", "delhi") in LOCATIONS else 0,
            key="birth_location_input"
        )
        st.session_state["birth_location_key"] = birth_location_key

    # Show current profile summary if set
    if has_profile:
        profile_loc = LOCATIONS.get(st.session_state["birth_location_key"], LOCATIONS["delhi"])
        st.markdown(f"""
        <div style="background: rgba(6, 147, 227, 0.1); padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem;">
            <div style="font-weight: 600;">👤 {st.session_state['user_display_name']}</div>
            <div style="font-size: 0.85rem; color: #9ca3af;">
                📅 {st.session_state['birth_date'].strftime('%b %d, %Y')}<br>
                🕐 {st.session_state['birth_time'].strftime('%H:%M')}<br>
                📍 {profile_loc['name']}
            </div>
        </div>
        """, unsafe_allow_html=True)

    # Get profile values (used across all pages)
    profile_name = st.session_state.get("user_display_name", "") or "Cosmic Explorer"
    profile_birth_date = st.session_state.get("birth_date", date(2000, 1, 1))
    profile_birth_time = st.session_state.get("birth_time", datetime.strptime("12:00", "%H:%M").time())
    profile_birth_location = st.session_state.get("birth_location_key", "delhi")

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

    # Navigation - Separated into Science and Astrology
    st.markdown("---")

    # Section selector
    section = st.radio(
        "Choose Section:",
        ["🔭 Science & Astronomy", "🔮 Astrology"],
        horizontal=True,
        key="section_selector"
    )

    st.markdown("---")

    if section == "🔭 Science & Astronomy":
        st.markdown("### 🔭 Science & Astronomy")
        st.caption("Factual, educational content based on real data")
        page = st.radio(
            "Explore the cosmos:",
            [
                "🏠 Home",
                "🗺️ World Map",
                "🌙 Celestial Calendar",
                "🌃 Tonight's Sky",
                "🔭 My Sky Tonight",
                "🌓 Moon Phases",
                "🌅 Sun Times",
                "🛰️ ISS Tracker",
                "📡 Satellite Tracker",
                "☄️ Meteor Showers",
                "☄️ Asteroid Hunter",
                "🕰️ Cosmic Time Machine",
                "🌍 Shared Sky",
                "✉️ Cosmic Postcard",
                "🔦 Light's Journey",
                "🪐 Exoplanet Explorer",
                "🎮 Planet Hunter",
                "🌌 Galaxy Quest",
                "🔭 Star Hunter",
                "🔬 Real Data Discovery",
                "🎯 Sky Bingo",
                "🌟 Star Stories",
                "📊 My Sky Data"
            ],
            label_visibility="collapsed"
        )
    else:
        st.markdown("### 🔮 Astrology")
        st.caption("Cultural & spiritual interpretations")
        page = st.radio(
            "Explore your charts:",
            [
                "🏠 Home",
                "📜 Birth Chart",
                "🔄 Retrograde Tracker",
                "⛅ Cosmic Weather",
                "⭐ Your Cosmic Twin"
            ],
            label_visibility="collapsed"
        )

        # Disclaimer for astrology section
        st.markdown("""
        <div style="background: rgba(249, 115, 22, 0.1); padding: 0.5rem; border-radius: 8px; border-left: 3px solid #f97316; margin-top: 1rem;">
            <small style="color: #f97316;">⚠️ <b>Note:</b> Astrology is a belief system, not science. Presented for cultural & entertainment purposes.</small>
        </div>
        """, unsafe_allow_html=True)

    # Override page if navigated from Home page buttons
    if "nav_page" in st.session_state and st.session_state["nav_page"]:
        page = st.session_state["nav_page"]
        st.session_state["nav_page"] = None  # Clear after use

    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; padding: 0.5rem 0; font-size: 0.75rem; color: #6b7280;">
        <div>AstroData v1.0</div>
        <div style="margin-top: 0.25rem;">
            <a href="https://laruneng.com" target="_blank" style="color: #0693e3; text-decoration: none;">Larun Engineering</a>
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.7rem; color: #4b5563;">
            Democratizing Space Education
        </div>
    </div>
    """, unsafe_allow_html=True)


# ============== HOME PAGE ==============
if page == "🏠 Home":
    # Motto card - compact tagline
    st.markdown("""
    <div style="background: linear-gradient(135deg, rgba(6, 147, 227, 0.1), rgba(99, 102, 241, 0.15));
                border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 12px;
                padding: 1rem 1.5rem; margin-bottom: 1.5rem; text-align: center;">
        <p style="margin: 0; font-size: 1.1rem; color: #fbbf24; font-weight: 500; letter-spacing: 1px;">
            ✨ Democratizing Space Education for Curious Minds Everywhere ✨
        </p>
    </div>
    """, unsafe_allow_html=True)

    # Quick stats row
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Locations", "150+", delta=None)
    with col2:
        st.metric("Planets", "8", delta=None)
    with col3:
        st.metric("Meteor Showers", "12+", delta=None)
    with col4:
        st.metric("Exoplanets", "5000+", delta=None)

    # NEW Feature Banner
    st.markdown("""
    <div style="background: linear-gradient(135deg, #0693e3 0%, #6366f1 50%, #d4a853 100%);
                border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;
                box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);">
        <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <span style="background: #ffffff; color: #0693e3; padding: 0.25rem 0.75rem;
                        border-radius: 20px; font-weight: 700; font-size: 0.8rem;">NEW</span>
            <div>
                <h3 style="margin: 0; color: #ffffff; font-size: 1.3rem;">🔬 Real Data Discovery Lab</h3>
                <p style="margin: 0.25rem 0 0 0; color: rgba(255,255,255,0.9); font-size: 0.95rem;">
                    Analyze real exoplanet atmospheres using spectroscopy! Detect elements, earn badges, and claim discovery certificates.
                </p>
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    if st.button("🚀 Start Discovering", type="primary", use_container_width=True):
        st.session_state["nav_page"] = "🔬 Real Data Discovery"
        st.rerun()

    st.markdown("---")

    # Feature cards - Interactive buttons
    st.markdown("### Explore the Universe")

    # Define features with their page names
    features = [
        {"icon": "🔬", "title": "Real Data Discovery", "page": "🔬 Real Data Discovery",
         "desc": "Analyze real exoplanet spectra, detect atmospheric elements, earn badges & certificates!"},
        {"icon": "🌃", "title": "Tonight's Sky", "page": "🌃 Tonight's Sky",
         "desc": "See what's visible in your night sky right now. Find planets, constellations, and celestial events."},
        {"icon": "🔭", "title": "My Sky Tonight", "page": "🔭 My Sky Tonight",
         "desc": "Get personalized equipment recommendations to observe deep sky objects."},
        {"icon": "📡", "title": "Satellite Tracker", "page": "📡 Satellite Tracker",
         "desc": "Track the ISS, Tiangong, and other satellites in real-time."},
        {"icon": "🕰️", "title": "Cosmic Time Machine", "page": "🕰️ Cosmic Time Machine",
         "desc": "Travel through time! See how the sky looked during historical events."},
        {"icon": "🪐", "title": "Exoplanet Explorer", "page": "🪐 Exoplanet Explorer",
         "desc": "Explore thousands of discovered exoplanets and habitable worlds."},
    ]

    # Create 3 columns for feature cards
    col1, col2, col3 = st.columns(3)
    cols = [col1, col2, col3]

    for i, feature in enumerate(features):
        with cols[i % 3]:
            st.markdown(f"""
            <div style="background: linear-gradient(145deg, rgba(6, 147, 227, 0.1), rgba(99, 102, 241, 0.1));
                        border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 16px; padding: 1.5rem;
                        margin-bottom: 1rem; min-height: 180px;">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">{feature['icon']}</div>
                <div style="font-size: 1.1rem; font-weight: 600; color: #ffffff; margin-bottom: 0.5rem;">{feature['title']}</div>
                <div style="font-size: 0.85rem; color: #9ca3af; line-height: 1.4;">{feature['desc']}</div>
            </div>
            """, unsafe_allow_html=True)
            if st.button(f"Open {feature['title']}", key=f"btn_{feature['page']}", use_container_width=True):
                st.session_state["nav_page"] = feature["page"]
                st.rerun()

    # More features section
    st.markdown("---")
    st.markdown("### More Features")

    more_features = [
        {"icon": "🗺️", "title": "World Map", "page": "🗺️ World Map", "desc": "Explore 150+ global locations"},
        {"icon": "🌙", "title": "Celestial Calendar", "page": "🌙 Celestial Calendar", "desc": "Track planetary positions"},
        {"icon": "🌓", "title": "Moon Phases", "page": "🌓 Moon Phases", "desc": "Lunar cycle tracker"},
        {"icon": "🌅", "title": "Sun Times", "page": "🌅 Sun Times", "desc": "Sunrise & sunset times"},
        {"icon": "🌍", "title": "Shared Sky", "page": "🌍 Shared Sky", "desc": "Find cities with your sky"},
        {"icon": "🌟", "title": "Star Stories", "page": "🌟 Star Stories", "desc": "Constellation mythology"},
    ]

    mcol1, mcol2, mcol3, mcol4, mcol5, mcol6 = st.columns(6)
    mcols = [mcol1, mcol2, mcol3, mcol4, mcol5, mcol6]

    for i, feature in enumerate(more_features):
        with mcols[i]:
            if st.button(f"{feature['icon']}\n{feature['title']}", key=f"btn2_{feature['page']}", use_container_width=True):
                st.session_state["nav_page"] = feature["page"]
                st.rerun()
            st.caption(feature['desc'])

    # Quick info expander
    with st.expander("About AstroData"):
        st.markdown("""
        **AstroData** is an educational astronomy platform designed to make real space science accessible to everyone worldwide.

        **Our Mission:** Democratize space education by providing:
        - Real astronomical data and calculations
        - Location-aware sky observations
        - Interactive celestial exploration
        - Educational content for all ages

        **Data Sources:**
        - Planetary positions: Astronomical algorithms
        - Moon phases: Precise lunar calculations
        - Satellite tracking: Orbital mechanics simulation
        - Exoplanets: NASA Exoplanet Archive

        Built with love by [Larun Engineering](https://laruneng.com)
        """)

# ============== WORLD MAP PAGE ==============
elif page == "🗺️ World Map":
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
    st.markdown("**Real-time planetary positions based on astronomical calculations**")

    st.info("🔬 This page shows scientific astronomical data - actual positions of celestial bodies in our solar system.")

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

    # Header info
    st.markdown(f"### Celestial Snapshot: {selected_datetime.strftime('%B %d, %Y at %H:%M')}")
    st.markdown(f"**📍 Observer Location:** {user_name} ({user_lat:.2f}°, {user_lon:.2f}°)")

    # Moon phase - Scientific
    st.markdown("---")
    st.subheader("🌙 Moon Phase")

    phase = positions["moon_phase"]["phase"]
    col_moon1, col_moon2 = st.columns([1, 2])

    with col_moon1:
        st.markdown(f"""
        <div class="cosmic-card" style="text-align: center;">
            <div style="font-size: 4rem;">{phase['emoji']}</div>
            <div style="font-size: 1.3rem; color: #a78bfa;"><b>{phase['name']}</b></div>
            <div style="color: #9ca3af;">{positions['moon_phase']['illumination']:.1f}% illuminated</div>
        </div>
        """, unsafe_allow_html=True)

    with col_moon2:
        # Calculate moon age
        sun_lon = positions["Sun"]["tropical"]
        moon_lon = positions["Moon"]["tropical"]
        phase_angle = (moon_lon - sun_lon) % 360
        moon_age = phase_angle / 12.19  # ~12.19° per day

        st.markdown(f"""
        <div class="cosmic-card">
            <h4>Moon Data</h4>
            <div><b>Phase Angle:</b> {phase_angle:.1f}°</div>
            <div><b>Moon Age:</b> ~{moon_age:.1f} days since New Moon</div>
            <div><b>Ecliptic Longitude:</b> {positions['Moon']['tropical']:.2f}°</div>
            <div><b>Distance:</b> ~384,400 km from Earth</div>
            <div style="margin-top: 0.5rem; color: #9ca3af; font-size: 0.85rem;">
                The Moon orbits Earth every 27.3 days (sidereal) or 29.5 days (synodic/phases).
            </div>
        </div>
        """, unsafe_allow_html=True)

    # Planetary positions - Scientific (only real planets)
    st.markdown("---")
    st.subheader("☀️ Solar System Positions")
    st.caption("Ecliptic longitude measured from the Vernal Equinox (0° point)")

    # Only show real celestial bodies (no Rahu/Ketu)
    planet_order = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]

    cols = st.columns(4)
    for i, planet in enumerate(planet_order):
        with cols[i % 4]:
            pos = positions[planet]
            symbol = PLANETS[planet]["symbol"]

            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center; padding: 1rem;">
                <div style="font-size: 2rem;">{symbol}</div>
                <div style="font-weight: bold;">{planet}</div>
                <div style="font-size: 1.2rem; color: #0693e3;">{pos['tropical']:.2f}°</div>
                <div style="font-size: 0.8rem; color: #9ca3af;">In {pos['sign']['name']} region</div>
            </div>
            """, unsafe_allow_html=True)

    # Detailed table
    st.markdown("---")
    st.subheader("📊 Detailed Planetary Data")

    planet_facts = {
        "Sun": {"distance": "149.6 million km", "type": "Star"},
        "Moon": {"distance": "384,400 km", "type": "Satellite"},
        "Mercury": {"distance": "77-222 million km", "type": "Planet"},
        "Venus": {"distance": "38-261 million km", "type": "Planet"},
        "Mars": {"distance": "55-401 million km", "type": "Planet"},
        "Jupiter": {"distance": "588-968 million km", "type": "Planet"},
        "Saturn": {"distance": "1.2-1.67 billion km", "type": "Planet"},
    }

    table_data = []
    for planet in planet_order:
        pos = positions[planet]
        facts = planet_facts[planet]
        table_data.append({
            "Body": f"{PLANETS[planet]['symbol']} {planet}",
            "Type": facts["type"],
            "Ecliptic Longitude": f"{pos['tropical']:.4f}°",
            "Constellation Region": pos['sign']['name'],
            "Distance from Earth": facts["distance"]
        })

    st.dataframe(pd.DataFrame(table_data), use_container_width=True, hide_index=True)

    # Educational info
    st.markdown("---")
    with st.expander("📚 Understanding Ecliptic Coordinates"):
        st.markdown("""
        **What is Ecliptic Longitude?**

        The ecliptic is the apparent path the Sun traces across the sky over a year. It's the plane of Earth's orbit around the Sun.

        - **0°** = Vernal Equinox (March 20-21, where Sun crosses celestial equator going north)
        - **90°** = Summer Solstice point
        - **180°** = Autumnal Equinox point
        - **270°** = Winter Solstice point

        All planets orbit roughly along this plane, so we measure their positions in degrees (0° to 360°) along the ecliptic.

        **Constellation Regions:**
        The zodiac constellations are simply star patterns in the background. When we say a planet is "in Aries," we mean it appears in that direction from Earth - the planet isn't physically near those stars.
        """)

    # Download option (Pro Feature)
    st.markdown("---")
    if check_pro_feature("Export Data", show_prompt=False):
        csv_data = pd.DataFrame(table_data).to_csv(index=False)
        st.download_button(
            label="📥 Download Data as CSV",
            data=csv_data,
            file_name=f"planetary_positions_{selected_datetime.strftime('%Y%m%d_%H%M')}.csv",
            mime="text/csv"
        )
    else:
        st.button("📥 Download Data as CSV ⭐ Pro", disabled=True, use_container_width=True)
        st.caption("Upgrade to Pro to export data")


# ============== TONIGHT'S SKY PAGE ==============

elif page == "🌃 Tonight's Sky":
    st.header("🌃 Tonight's Sky")
    st.markdown(f"**What's visible from {user_name} tonight?**")

    now = datetime.now()
    tonight_positions = get_all_planetary_positions(now, user_lat, user_lon, user_country)

    # Visible planets tonight
    st.subheader("🪐 Planets Visible Tonight")

    visible_planets = []
    for planet in ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"]:
        pos = tonight_positions[planet]
        # Simplified visibility check based on elongation from Sun
        sun_lon = tonight_positions["Sun"]["tropical"]
        planet_lon = pos["tropical"]
        elongation = abs(planet_lon - sun_lon)
        if elongation > 180:
            elongation = 360 - elongation

        if elongation > 15:  # More than 15° from Sun = potentially visible
            visible_planets.append({
                "planet": planet,
                "elongation": elongation,
                "constellation": pos["sign"]["name"],
                "symbol": PLANETS[planet]["symbol"]
            })

    if visible_planets:
        cols = st.columns(len(visible_planets))
        for i, vp in enumerate(visible_planets):
            with cols[i]:
                brightness = "Bright" if vp["planet"] in ["Venus", "Jupiter"] else "Visible"
                st.markdown(f"""
                <div class="cosmic-card" style="text-align: center;">
                    <div style="font-size: 2.5rem;">{vp['symbol']}</div>
                    <div style="font-weight: bold;">{vp['planet']}</div>
                    <div style="color: #9ca3af;">In {vp['constellation']}</div>
                    <div style="color: #22c55e; font-size: 0.8rem;">{brightness}</div>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.info("No planets are well-positioned for viewing tonight. Try again tomorrow!")

    # Moon info
    st.markdown("---")
    st.subheader("🌙 Tonight's Moon")

    moon_pos = tonight_positions["Moon"]
    sun_lon = tonight_positions["Sun"]["tropical"]
    moon_lon = moon_pos["tropical"]
    phase_angle = (moon_lon - sun_lon) % 360

    # Determine moon phase
    if phase_angle < 22.5:
        moon_phase, moon_emoji = "New Moon", "🌑"
    elif phase_angle < 67.5:
        moon_phase, moon_emoji = "Waxing Crescent", "🌒"
    elif phase_angle < 112.5:
        moon_phase, moon_emoji = "First Quarter", "🌓"
    elif phase_angle < 157.5:
        moon_phase, moon_emoji = "Waxing Gibbous", "🌔"
    elif phase_angle < 202.5:
        moon_phase, moon_emoji = "Full Moon", "🌕"
    elif phase_angle < 247.5:
        moon_phase, moon_emoji = "Waning Gibbous", "🌖"
    elif phase_angle < 292.5:
        moon_phase, moon_emoji = "Last Quarter", "🌗"
    elif phase_angle < 337.5:
        moon_phase, moon_emoji = "Waning Crescent", "🌘"
    else:
        moon_phase, moon_emoji = "New Moon", "🌑"

    illumination = (1 - math.cos(math.radians(phase_angle))) / 2 * 100

    col_m1, col_m2 = st.columns(2)
    with col_m1:
        st.markdown(f"""
        <div class="cosmic-card" style="text-align: center;">
            <div style="font-size: 4rem;">{moon_emoji}</div>
            <div style="font-size: 1.5rem; font-weight: bold;">{moon_phase}</div>
            <div style="color: #9ca3af;">Illumination: {illumination:.0f}%</div>
            <div style="color: #9ca3af;">In {moon_pos['sign']['name']}</div>
        </div>
        """, unsafe_allow_html=True)

    with col_m2:
        st.markdown("""
        <div class="cosmic-card">
            <h4>Best Viewing Tips</h4>
            <ul>
                <li><b>Planets:</b> Look for steady, non-twinkling lights</li>
                <li><b>Venus:</b> Brightest - visible near sunrise/sunset</li>
                <li><b>Jupiter:</b> Very bright - visible most of night</li>
                <li><b>Saturn:</b> Yellowish tint, rings visible with telescope</li>
                <li><b>Mars:</b> Reddish color, varies in brightness</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    # Upcoming celestial events
    st.markdown("---")
    st.subheader("📅 Upcoming Celestial Events")

    events = [
        {"date": "2025-01-13", "event": "Full Moon (Wolf Moon)", "type": "Moon"},
        {"date": "2025-01-29", "event": "New Moon", "type": "Moon"},
        {"date": "2025-03-14", "event": "Total Lunar Eclipse", "type": "Eclipse"},
        {"date": "2025-03-29", "event": "Partial Solar Eclipse", "type": "Eclipse"},
        {"date": "2025-04-08", "event": "Venus at Greatest Elongation", "type": "Planet"},
        {"date": "2025-08-12", "event": "Perseid Meteor Shower Peak", "type": "Meteor"},
    ]

    for evt in events[:4]:
        evt_date = datetime.strptime(evt["date"], "%Y-%m-%d")
        days_until = (evt_date.date() - date.today()).days
        if days_until >= 0:
            emoji = "🌕" if evt["type"] == "Moon" else "🌑" if "New" in evt["event"] else "☀️" if evt["type"] == "Eclipse" else "☄️"
            st.markdown(f"""
            <div style="padding: 0.5rem; border-left: 3px solid #0693e3; margin: 0.5rem 0; background: rgba(6, 147, 227, 0.1); border-radius: 0 8px 8px 0;">
                {emoji} <b>{evt['event']}</b><br>
                <span style="color: #9ca3af;">{evt_date.strftime('%B %d, %Y')} ({days_until} days away)</span>
            </div>
            """, unsafe_allow_html=True)


# ============== MY SKY TONIGHT PAGE ==============

elif page == "🔭 My Sky Tonight":
    st.header("🔭 My Sky Tonight - Equipment Guide")
    st.markdown(f"**What can you observe from {user_name} tonight and what equipment do you need?**")

    now = datetime.now()
    tonight_positions = get_all_planetary_positions(now, user_lat, user_lon, user_country)

    # Equipment categories
    EQUIPMENT_LEVELS = {
        "naked_eye": {"name": "👁️ Naked Eye", "desc": "No equipment needed", "mag_limit": 6.0},
        "binoculars": {"name": "🔍 Binoculars", "desc": "7x50 or 10x50 binoculars", "mag_limit": 9.5},
        "small_scope": {"name": "🔭 Small Telescope", "desc": "60-80mm refractor or 4\" reflector", "mag_limit": 11.5},
        "medium_scope": {"name": "🔭 Medium Telescope", "desc": "6-8\" reflector or 4\" APO", "mag_limit": 13.0},
        "large_scope": {"name": "🔭 Large Telescope", "desc": "10\"+ Dobsonian or SCT", "mag_limit": 14.5},
    }

    # Celestial objects catalog with visibility requirements
    OBSERVABLE_OBJECTS = {
        # Naked Eye Objects
        "planets": [
            {"name": "Venus", "type": "Planet", "min_equip": "naked_eye", "mag": -4.5, "notes": "Brightest planet, visible near sunrise/sunset", "best_focal": "Any"},
            {"name": "Jupiter", "type": "Planet", "min_equip": "naked_eye", "mag": -2.5, "notes": "4 Galilean moons visible with binoculars", "best_focal": "25-50mm eyepiece"},
            {"name": "Saturn", "type": "Planet", "min_equip": "naked_eye", "mag": 0.5, "notes": "Rings visible with 25x+ magnification", "best_focal": "10-20mm eyepiece"},
            {"name": "Mars", "type": "Planet", "min_equip": "naked_eye", "mag": 1.0, "notes": "Red color, polar caps with 150x+", "best_focal": "6-10mm eyepiece"},
            {"name": "Mercury", "type": "Planet", "min_equip": "naked_eye", "mag": 0.5, "notes": "Elusive, only visible near horizon", "best_focal": "Any"},
        ],
        "stars": [
            {"name": "Sirius", "type": "Star", "min_equip": "naked_eye", "mag": -1.46, "notes": "Brightest star in the night sky", "best_focal": "Wide field"},
            {"name": "Canopus", "type": "Star", "min_equip": "naked_eye", "mag": -0.72, "notes": "2nd brightest, Southern Hemisphere", "best_focal": "Wide field"},
            {"name": "Arcturus", "type": "Star", "min_equip": "naked_eye", "mag": -0.05, "notes": "Orange giant, follow Big Dipper's arc", "best_focal": "Wide field"},
            {"name": "Vega", "type": "Star", "min_equip": "naked_eye", "mag": 0.03, "notes": "Blue-white, Summer Triangle", "best_focal": "Wide field"},
            {"name": "Betelgeuse", "type": "Star", "min_equip": "naked_eye", "mag": 0.5, "notes": "Red supergiant in Orion", "best_focal": "Wide field"},
            {"name": "Polaris", "type": "Star", "min_equip": "naked_eye", "mag": 2.0, "notes": "North Star, nearly fixed position", "best_focal": "Wide field"},
        ],
        "deep_sky_naked": [
            {"name": "Andromeda Galaxy (M31)", "type": "Galaxy", "min_equip": "naked_eye", "mag": 3.4, "notes": "Farthest naked-eye object, 2.5M light-years", "best_focal": "32mm+ wide field"},
            {"name": "Pleiades (M45)", "type": "Star Cluster", "min_equip": "naked_eye", "mag": 1.6, "notes": "Seven Sisters, stunning in binoculars", "best_focal": "32mm wide field"},
            {"name": "Orion Nebula (M42)", "type": "Nebula", "min_equip": "naked_eye", "mag": 4.0, "notes": "Brightest nebula, visible in Orion's sword", "best_focal": "25-32mm eyepiece"},
            {"name": "Milky Way Core", "type": "Galaxy", "min_equip": "naked_eye", "mag": "N/A", "notes": "Best seen from dark sites in summer", "best_focal": "Wide angle"},
        ],
        "deep_sky_binos": [
            {"name": "Double Cluster (NGC 869/884)", "type": "Star Cluster", "min_equip": "binoculars", "mag": 4.3, "notes": "Beautiful twin clusters in Perseus", "best_focal": "25-32mm"},
            {"name": "M13 Great Globular", "type": "Globular Cluster", "min_equip": "binoculars", "mag": 5.8, "notes": "Best globular in Northern Hemisphere", "best_focal": "15-20mm"},
            {"name": "M44 Beehive Cluster", "type": "Star Cluster", "min_equip": "binoculars", "mag": 3.7, "notes": "Large open cluster in Cancer", "best_focal": "32mm wide field"},
            {"name": "M8 Lagoon Nebula", "type": "Nebula", "min_equip": "binoculars", "mag": 6.0, "notes": "Naked eye from dark sites, great in binos", "best_focal": "20-32mm"},
        ],
        "deep_sky_telescope": [
            {"name": "Ring Nebula (M57)", "type": "Planetary Nebula", "min_equip": "small_scope", "mag": 8.8, "notes": "Classic ring shape, easy to find in Lyra", "best_focal": "8-12mm"},
            {"name": "Whirlpool Galaxy (M51)", "type": "Galaxy", "min_equip": "small_scope", "mag": 8.4, "notes": "Classic spiral, needs dark skies", "best_focal": "12-20mm"},
            {"name": "Crab Nebula (M1)", "type": "Supernova Remnant", "min_equip": "small_scope", "mag": 8.4, "notes": "Remnant of 1054 AD supernova", "best_focal": "12-18mm"},
            {"name": "Dumbbell Nebula (M27)", "type": "Planetary Nebula", "min_equip": "binoculars", "mag": 7.5, "notes": "Large, bright planetary nebula", "best_focal": "15-25mm"},
            {"name": "Sombrero Galaxy (M104)", "type": "Galaxy", "min_equip": "medium_scope", "mag": 8.0, "notes": "Distinctive dust lane, needs aperture", "best_focal": "10-15mm"},
            {"name": "Horsehead Nebula", "type": "Dark Nebula", "min_equip": "large_scope", "mag": "N/A", "notes": "Challenging, needs H-beta filter", "best_focal": "25mm + filter"},
        ],
        "moon_features": [
            {"name": "Mare Tranquillitatis", "type": "Lunar Sea", "min_equip": "naked_eye", "mag": "N/A", "notes": "Apollo 11 landing site area", "best_focal": "10-15mm"},
            {"name": "Tycho Crater", "type": "Crater", "min_equip": "binoculars", "mag": "N/A", "notes": "Young crater with prominent rays", "best_focal": "6-10mm"},
            {"name": "Copernicus Crater", "type": "Crater", "min_equip": "binoculars", "mag": "N/A", "notes": "Complex crater with terraced walls", "best_focal": "6-10mm"},
            {"name": "Lunar Terminator", "type": "Feature", "min_equip": "binoculars", "mag": "N/A", "notes": "Best detail at shadow line", "best_focal": "8-15mm"},
        ]
    }

    # Equipment selector
    st.subheader("🎯 Select Your Equipment")
    equipment_choice = st.radio(
        "What will you be using tonight?",
        list(EQUIPMENT_LEVELS.keys()),
        format_func=lambda x: f"{EQUIPMENT_LEVELS[x]['name']} - {EQUIPMENT_LEVELS[x]['desc']}",
        horizontal=True
    )

    selected_equip = EQUIPMENT_LEVELS[equipment_choice]
    equip_index = list(EQUIPMENT_LEVELS.keys()).index(equipment_choice)

    st.markdown(f"""
    <div class="cosmic-card">
        <h4>{selected_equip['name']}</h4>
        <p>{selected_equip['desc']}</p>
        <p style="color: #22c55e;">Magnitude limit: ~{selected_equip['mag_limit']}</p>
    </div>
    """, unsafe_allow_html=True)

    # Filter and display observable objects
    st.markdown("---")
    st.subheader("🌟 Observable Objects Tonight")

    all_objects = []
    for category, objects in OBSERVABLE_OBJECTS.items():
        for obj in objects:
            obj_equip_index = list(EQUIPMENT_LEVELS.keys()).index(obj["min_equip"])
            if obj_equip_index <= equip_index:
                obj["category"] = category
                all_objects.append(obj)

    # Group by viewing difficulty
    st.markdown("### 👁️ Easy to Find (Naked Eye / Bright)")
    easy_objects = [o for o in all_objects if o["min_equip"] in ["naked_eye"]]

    if easy_objects:
        for obj in easy_objects[:8]:
            mag_display = f"Mag {obj['mag']}" if obj['mag'] != "N/A" else ""
            st.markdown(f"""
            <div style="padding: 0.75rem; margin: 0.5rem 0; background: rgba(34, 197, 94, 0.1); border-left: 3px solid #22c55e; border-radius: 0 8px 8px 0;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <div>
                        <b>{obj['name']}</b> <span style="color: #9ca3af;">({obj['type']})</span>
                    </div>
                    <div style="color: #22c55e; font-size: 0.85rem;">{mag_display}</div>
                </div>
                <div style="color: #9ca3af; font-size: 0.9rem; margin-top: 0.25rem;">{obj['notes']}</div>
                <div style="color: #a78bfa; font-size: 0.8rem; margin-top: 0.25rem;">Recommended: {obj['best_focal']}</div>
            </div>
            """, unsafe_allow_html=True)

    if equipment_choice != "naked_eye":
        st.markdown("### 🔍 Requires Optical Aid")
        harder_objects = [o for o in all_objects if o["min_equip"] != "naked_eye"]

        for obj in harder_objects[:10]:
            equip_needed = EQUIPMENT_LEVELS[obj["min_equip"]]["name"]
            mag_display = f"Mag {obj['mag']}" if obj['mag'] != "N/A" else ""
            st.markdown(f"""
            <div style="padding: 0.75rem; margin: 0.5rem 0; background: rgba(99, 102, 241, 0.1); border-left: 3px solid #6366f1; border-radius: 0 8px 8px 0;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <div>
                        <b>{obj['name']}</b> <span style="color: #9ca3af;">({obj['type']})</span>
                    </div>
                    <div style="color: #6366f1; font-size: 0.85rem;">{mag_display}</div>
                </div>
                <div style="color: #9ca3af; font-size: 0.9rem; margin-top: 0.25rem;">{obj['notes']}</div>
                <div style="color: #fbbf24; font-size: 0.8rem; margin-top: 0.25rem;">Minimum: {equip_needed} | Best: {obj['best_focal']}</div>
            </div>
            """, unsafe_allow_html=True)

    # Equipment recommendations
    st.markdown("---")
    st.subheader("🛒 Equipment Recommendations by Budget")

    with st.expander("💰 Budget-Friendly Starter Kit (Under $150)"):
        st.markdown("""
        **Binoculars: 10x50 or 7x50**
        - Celestron Cometron 7x50 (~$35)
        - Nikon Aculon 10x50 (~$90)

        **What you can see:**
        - Moon craters and maria
        - Jupiter's 4 Galilean moons
        - Orion Nebula structure
        - Andromeda Galaxy core
        - Star clusters (Pleiades, Double Cluster)
        - Saturn as elongated shape

        **Recommended eyepiece focal lengths:** Built-in (fixed)
        """)

    with st.expander("🔭 Intermediate Setup ($150-500)"):
        st.markdown("""
        **Telescope Options:**
        - Sky-Watcher Heritage 130P Dobsonian (~$230)
        - Celestron StarSense Explorer LT 80AZ (~$200)
        - Orion StarBlast 4.5" Tabletop (~$250)

        **Eyepieces to consider:**
        - 25-32mm for wide field (galaxies, nebulae)
        - 10-15mm for medium power (planets, clusters)
        - 6-8mm for high power (Moon, planets)

        **What you can see:**
        - Saturn's rings clearly
        - Jupiter's cloud bands
        - Mars surface features (when close)
        - Dozens of galaxies and nebulae
        - Globular cluster resolution
        """)

    with st.expander("🌟 Advanced Setup ($500-1500)"):
        st.markdown("""
        **Telescope Options:**
        - Apertura AD8 8" Dobsonian (~$650)
        - Sky-Watcher 6" f/8 Dobsonian (~$500)
        - Celestron NexStar 6SE (~$1000)

        **Essential eyepieces:**
        - 30-40mm 2" wide field (68°+ AFOV)
        - 12-15mm planetary
        - 5-8mm high power with Barlow
        - Filters: Moon, OIII, UHC

        **Focal length guide:**
        - Low power (20-40x): 25-40mm eyepiece - Wide field views
        - Medium power (50-100x): 10-18mm eyepiece - Most objects
        - High power (150-250x): 5-8mm eyepiece - Planets, Moon
        - Very high (300x+): Only on excellent nights
        """)

    with st.expander("📐 Understanding Focal Length & Magnification"):
        st.markdown("""
        **How to calculate magnification:**

        `Magnification = Telescope Focal Length ÷ Eyepiece Focal Length`

        **Example:** 1000mm telescope with 10mm eyepiece = 100x

        **Focal Length Guidelines:**

        | Eyepiece | Typical Mag (1000mm scope) | Best For |
        |----------|---------------------------|----------|
        | 40mm | 25x | Wide field, large nebulae |
        | 25mm | 40x | Star clusters, galaxies |
        | 15mm | 67x | Moon, brighter DSOs |
        | 10mm | 100x | Planets, lunar detail |
        | 6mm | 167x | Planetary detail |
        | 4mm | 250x | Double stars, lunar |

        **Maximum useful magnification:** ~50x per inch of aperture
        - 4" telescope: ~200x max
        - 6" telescope: ~300x max
        - 8" telescope: ~400x max

        **Note:** Higher isn't always better! Lower magnification often gives sharper, brighter views.
        """)


# ============== SATELLITE TRACKER PAGE ==============

elif page == "📡 Satellite Tracker":
    st.header("📡 Satellite & Space Debris Tracker")
    st.markdown("**Track satellites, space stations, and objects de-orbiting**")

    tracker_mode = st.radio(
        "What would you like to track?",
        ["🛰️ Space Stations", "📡 Notable Satellites", "🔥 De-orbiting Objects", "🗑️ Space Debris Info"],
        horizontal=True
    )

    if tracker_mode == "🛰️ Space Stations":
        # Reuse the space station tracking code
        st.subheader("🛰️ Active Space Stations")

        now = datetime.now()
        time_since_midnight = now.hour * 60 + now.minute + now.second / 60

        # ISS
        iss_orbital_period = 92
        iss_orbital_position = (time_since_midnight / iss_orbital_period * 360) % 360
        iss_lat = 51.6 * math.sin(math.radians(iss_orbital_position * 1.5))
        iss_lon = (iss_orbital_position * 4 - 180) % 360 - 180

        # Tiangong
        tiangong_orbital_period = 91
        tiangong_orbital_position = ((time_since_midnight + 45) / tiangong_orbital_period * 360) % 360
        tiangong_lat = 41.5 * math.sin(math.radians(tiangong_orbital_position * 1.5))
        tiangong_lon = (tiangong_orbital_position * 4 - 120) % 360 - 180

        sat_map = folium.Map(location=[0, 0], zoom_start=2, tiles='CartoDB dark_matter')

        folium.Marker([iss_lat, iss_lon], popup="ISS",
                      icon=folium.DivIcon(html='<div style="font-size: 24px;">🛰️</div>', icon_size=(30, 30))).add_to(sat_map)
        folium.Marker([tiangong_lat, tiangong_lon], popup="Tiangong",
                      icon=folium.DivIcon(html='<div style="font-size: 24px;">🚀</div>', icon_size=(30, 30))).add_to(sat_map)
        folium.Marker([user_lat, user_lon], popup=user_name, icon=folium.Icon(color='blue')).add_to(sat_map)

        st_folium(sat_map, width=700, height=350)

        st.info("For detailed pass predictions, visit heavens-above.com or use the ISS Detector app.")

    elif tracker_mode == "📡 Notable Satellites":
        st.subheader("📡 Notable Satellites in Orbit")

        notable_sats = [
            {"name": "Hubble Space Telescope", "type": "Science", "altitude": "540 km", "launched": "1990", "status": "✅ Active", "notes": "Visible mag ~2 at best passes"},
            {"name": "Starlink Constellation", "type": "Communication", "altitude": "550 km", "launched": "2019+", "status": "✅ Active", "notes": "~5000+ satellites, often visible trains after launch"},
            {"name": "OneWeb Constellation", "type": "Communication", "altitude": "1200 km", "launched": "2020+", "status": "✅ Active", "notes": "~600 satellites"},
            {"name": "GPS Satellites", "type": "Navigation", "altitude": "20,200 km", "launched": "1978+", "status": "✅ Active", "notes": "31 operational satellites"},
            {"name": "James Webb Telescope", "type": "Science", "altitude": "L2 (1.5M km)", "launched": "2021", "status": "✅ Active", "notes": "Not visible from Earth (too far)"},
            {"name": "GOES Weather Sats", "type": "Weather", "altitude": "35,786 km", "launched": "1975+", "status": "✅ Active", "notes": "Geostationary, appear stationary in sky"},
        ]

        for sat in notable_sats:
            st.markdown(f"""
            <div class="cosmic-card" style="margin: 0.5rem 0;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <div><b>{sat['name']}</b> <span style="color: #9ca3af;">({sat['type']})</span></div>
                    <div>{sat['status']}</div>
                </div>
                <div style="color: #9ca3af; font-size: 0.9rem;">
                    Altitude: {sat['altitude']} | Since: {sat['launched']}
                </div>
                <div style="color: #a78bfa; font-size: 0.85rem; margin-top: 0.25rem;">{sat['notes']}</div>
            </div>
            """, unsafe_allow_html=True)

    elif tracker_mode == "🔥 De-orbiting Objects":
        st.subheader("🔥 Recent & Upcoming De-orbit Events")

        st.warning("⚠️ De-orbit predictions are approximate. Actual reentry times can vary by hours due to solar activity affecting atmospheric drag.")

        deorbit_events = [
            {"name": "ISS (Planned)", "type": "Space Station", "expected": "2030-2031", "status": "🗓️ Scheduled", "notes": "Controlled deorbit planned over Pacific Ocean"},
            {"name": "Tiangong-1", "type": "Space Station", "expected": "April 2018", "status": "✅ Complete", "notes": "Uncontrolled reentry over South Pacific"},
            {"name": "Tiangong-2", "type": "Space Station", "expected": "July 2019", "status": "✅ Complete", "notes": "Controlled deorbit"},
            {"name": "Skylab", "type": "Space Station", "expected": "July 1979", "status": "✅ Complete", "notes": "Debris fell over Australia"},
            {"name": "Mir", "type": "Space Station", "expected": "March 2001", "status": "✅ Complete", "notes": "Controlled deorbit over Pacific"},
            {"name": "Long March 5B Stages", "type": "Rocket Body", "expected": "Periodic", "status": "⚠️ Recurring", "notes": "Uncontrolled reentries of large rocket stages"},
        ]

        for evt in deorbit_events:
            color = "#22c55e" if evt["status"] == "✅ Complete" else "#fbbf24" if "Scheduled" in evt["status"] else "#ef4444"
            st.markdown(f"""
            <div style="padding: 0.75rem; margin: 0.5rem 0; background: rgba(99, 102, 241, 0.1); border-left: 3px solid {color}; border-radius: 0 8px 8px 0;">
                <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
                    <div><b>{evt['name']}</b> <span style="color: #9ca3af;">({evt['type']})</span></div>
                    <div style="color: {color};">{evt['status']}</div>
                </div>
                <div style="color: #9ca3af; font-size: 0.9rem;">Expected: {evt['expected']}</div>
                <div style="color: #a78bfa; font-size: 0.85rem; margin-top: 0.25rem;">{evt['notes']}</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("---")
        st.markdown("### 📊 How De-orbiting Works")
        st.markdown("""
        **Controlled Deorbit:**
        - Spacecraft fires engines to lower orbit
        - Aimed at uninhabited ocean areas (usually South Pacific "spacecraft cemetery")
        - Predictable timing within minutes

        **Uncontrolled Reentry:**
        - Orbit decays naturally due to atmospheric drag
        - Timing uncertain (can vary by hours)
        - Location unpredictable until final orbits
        - Most debris burns up; large objects may survive

        **Factors Affecting Decay:**
        - Solar activity (expands atmosphere)
        - Object size and shape
        - Initial orbit altitude
        """)

    else:  # Space Debris Info
        st.subheader("🗑️ Space Debris Situation")

        debris_stats = [
            ("Tracked Objects (>10cm)", "~35,000"),
            ("Estimated Debris (1-10cm)", "~1,000,000"),
            ("Particles (<1cm)", "~130,000,000"),
            ("Active Satellites", "~8,000"),
            ("Defunct Satellites", "~3,500"),
        ]

        cols = st.columns(3)
        for i, (label, value) in enumerate(debris_stats):
            with cols[i % 3]:
                st.markdown(f"""
                <div class="cosmic-card" style="text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: bold; color: #fbbf24;">{value}</div>
                    <div style="font-size: 0.85rem; color: #9ca3af;">{label}</div>
                </div>
                """, unsafe_allow_html=True)

        st.markdown("---")
        st.markdown("### 🚨 Major Debris Events")

        events = [
            {"year": "2007", "event": "China ASAT Test", "debris": "~3,500 pieces", "desc": "Intentional destruction of Fengyun-1C satellite"},
            {"year": "2009", "event": "Iridium-Cosmos Collision", "debris": "~2,300 pieces", "desc": "First accidental hypervelocity collision"},
            {"year": "2021", "event": "Russia ASAT Test", "debris": "~1,500 pieces", "desc": "Destruction of Cosmos 1408, threatened ISS"},
        ]

        for evt in events:
            st.markdown(f"""
            <div style="padding: 0.75rem; margin: 0.5rem 0; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 0 8px 8px 0;">
                <b>{evt['year']}: {evt['event']}</b>
                <div style="color: #ef4444;">{evt['debris']} created</div>
                <div style="color: #9ca3af; font-size: 0.9rem;">{evt['desc']}</div>
            </div>
            """, unsafe_allow_html=True)

        with st.expander("📚 Learn More About Space Debris"):
            st.markdown("""
            **Kessler Syndrome:**
            Theoretical scenario where debris density triggers cascading collisions,
            potentially making some orbits unusable for generations.

            **Active Debris Removal (ADR):**
            Planned missions to remove large debris objects:
            - ESA ClearSpace-1 (2026) - first debris removal mission
            - ELSA-d (2021) - magnetic capture demonstration

            **Tracking Resources:**
            - [Space-Track.org](https://www.space-track.org) - Official US tracking data
            - [Heavens-Above](https://heavens-above.com) - Satellite pass predictions
            - [Stuffin.Space](https://stuffin.space) - 3D debris visualization
            """)


# ============== MOON PHASES PAGE ==============

elif page == "🌓 Moon Phases":
    st.header("🌓 Moon Phase Calendar")
    st.markdown("**Track the lunar cycle throughout the month**")

    # Month selector
    col1, col2 = st.columns([1, 3])
    with col1:
        selected_year = st.selectbox("Year:", range(2020, 2031), index=5)
        selected_month = st.selectbox("Month:", range(1, 13), index=date.today().month - 1,
                                       format_func=lambda x: datetime(2000, x, 1).strftime('%B'))

    with col2:
        st.markdown(f"### {datetime(selected_year, selected_month, 1).strftime('%B %Y')}")

        # Generate moon phases for the month
        import calendar
        num_days = calendar.monthrange(selected_year, selected_month)[1]

        # Create calendar grid
        phases_data = []
        for day in range(1, num_days + 1):
            day_date = date(selected_year, selected_month, day)
            jd = julian_day(selected_year, selected_month, day, 12)

            # Get sun and moon positions
            sun_lon = get_sun_longitude(jd)
            moon_lon = get_moon_longitude(jd)
            phase_angle = (moon_lon - sun_lon) % 360

            # Determine phase
            if phase_angle < 22.5 or phase_angle >= 337.5:
                emoji = "🌑"
            elif phase_angle < 67.5:
                emoji = "🌒"
            elif phase_angle < 112.5:
                emoji = "🌓"
            elif phase_angle < 157.5:
                emoji = "🌔"
            elif phase_angle < 202.5:
                emoji = "🌕"
            elif phase_angle < 247.5:
                emoji = "🌖"
            elif phase_angle < 292.5:
                emoji = "🌗"
            else:
                emoji = "🌘"

            phases_data.append({"day": day, "emoji": emoji, "angle": phase_angle})

        # Display as grid (7 columns for days of week)
        first_weekday = date(selected_year, selected_month, 1).weekday()
        weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        # Header row
        header_cols = st.columns(7)
        for i, wd in enumerate(weekdays):
            with header_cols[i]:
                st.markdown(f"<div style='text-align: center; font-weight: bold;'>{wd}</div>", unsafe_allow_html=True)

        # Calendar grid
        day_idx = 0
        for week in range(6):
            if day_idx >= len(phases_data):
                break
            week_cols = st.columns(7)
            for weekday in range(7):
                with week_cols[weekday]:
                    if week == 0 and weekday < first_weekday:
                        st.write("")
                    elif day_idx < len(phases_data):
                        pd = phases_data[day_idx]
                        is_today = date(selected_year, selected_month, pd["day"]) == date.today()
                        bg = "rgba(6, 147, 227, 0.2)" if is_today else "transparent"
                        st.markdown(f"""
                        <div style="text-align: center; padding: 0.3rem; background: {bg}; border-radius: 8px;">
                            <div style="font-size: 1.5rem;">{pd['emoji']}</div>
                            <div style="font-size: 0.8rem;">{pd['day']}</div>
                        </div>
                        """, unsafe_allow_html=True)
                        day_idx += 1

    # Moon phase guide
    st.markdown("---")
    st.subheader("📖 Moon Phase Guide")
    guide_cols = st.columns(4)
    phases_info = [
        ("🌑", "New Moon", "Moon between Earth & Sun - invisible"),
        ("🌓", "First Quarter", "Right half illuminated - waxing"),
        ("🌕", "Full Moon", "Moon opposite Sun - fully lit"),
        ("🌗", "Last Quarter", "Left half illuminated - waning"),
    ]
    for i, (emoji, name, desc) in enumerate(phases_info):
        with guide_cols[i]:
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="font-size: 2rem;">{emoji}</div>
                <div style="font-weight: bold;">{name}</div>
                <div style="font-size: 0.8rem; color: #9ca3af;">{desc}</div>
            </div>
            """, unsafe_allow_html=True)


# ============== SUN TIMES PAGE ==============

elif page == "🌅 Sun Times":
    st.header("🌅 Sunrise & Sunset Calculator")
    st.markdown(f"**Solar times for {user_name}**")

    # Date selector
    sun_date = st.date_input("Select Date:", value=date.today())

    # Calculate sun times
    day_of_year = sun_date.timetuple().tm_yday

    # Solar declination
    declination = 23.45 * math.sin(math.radians((360/365) * (day_of_year - 81)))

    lat_rad = math.radians(user_lat)
    dec_rad = math.radians(declination)

    # Hour angle at sunrise/sunset
    try:
        cos_hour_angle = -math.tan(lat_rad) * math.tan(dec_rad)
        cos_hour_angle = max(-1, min(1, cos_hour_angle))  # Clamp for polar regions
        hour_angle = math.degrees(math.acos(cos_hour_angle))

        # Solar noon (approximate)
        solar_noon = 12.0 - (user_lon / 15)  # Adjust for longitude
        tz_offset = get_timezone_offset(user_country)
        solar_noon += tz_offset

        sunrise_hour = solar_noon - (hour_angle / 15)
        sunset_hour = solar_noon + (hour_angle / 15)
        daylight_hours = 2 * hour_angle / 15

        # Convert to time strings
        def hours_to_time(h):
            h = h % 24
            hours = int(h)
            minutes = int((h - hours) * 60)
            return f"{hours:02d}:{minutes:02d}"

        sunrise_time = hours_to_time(sunrise_hour)
        sunset_time = hours_to_time(sunset_hour)

        # Golden hour times
        golden_morning_end = hours_to_time(sunrise_hour + 1)
        golden_evening_start = hours_to_time(sunset_hour - 1)

        # Display
        col1, col2, col3 = st.columns(3)

        with col1:
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="font-size: 3rem;">🌅</div>
                <div style="color: #f59e0b;"><b>Sunrise</b></div>
                <div style="font-size: 2rem;">{sunrise_time}</div>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="font-size: 3rem;">☀️</div>
                <div style="color: #fbbf24;"><b>Solar Noon</b></div>
                <div style="font-size: 2rem;">{hours_to_time(solar_noon)}</div>
            </div>
            """, unsafe_allow_html=True)

        with col3:
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="font-size: 3rem;">🌇</div>
                <div style="color: #ea580c;"><b>Sunset</b></div>
                <div style="font-size: 2rem;">{sunset_time}</div>
            </div>
            """, unsafe_allow_html=True)

        # Additional info
        st.markdown("---")
        col_info1, col_info2 = st.columns(2)

        with col_info1:
            st.markdown(f"""
            <div class="cosmic-card">
                <h4>📊 Day Statistics</h4>
                <div><b>Daylight:</b> {daylight_hours:.1f} hours</div>
                <div><b>Night:</b> {24 - daylight_hours:.1f} hours</div>
                <div><b>Solar Declination:</b> {declination:.1f}°</div>
            </div>
            """, unsafe_allow_html=True)

        with col_info2:
            st.markdown(f"""
            <div class="cosmic-card">
                <h4>📸 Golden Hour (Best Light)</h4>
                <div><b>Morning:</b> {sunrise_time} - {golden_morning_end}</div>
                <div><b>Evening:</b> {golden_evening_start} - {sunset_time}</div>
                <div style="color: #9ca3af; font-size: 0.85rem;">Perfect for photography!</div>
            </div>
            """, unsafe_allow_html=True)

    except:
        st.warning("⚠️ This location experiences polar day or night on this date.")
        if user_lat > 66.5:
            st.info("🌞 24-hour daylight (Midnight Sun)")
        else:
            st.info("🌑 24-hour darkness (Polar Night)")


# ============== METEOR SHOWERS PAGE ==============

elif page == "☄️ Meteor Showers":
    st.header("☄️ Meteor Shower Calendar")
    st.markdown("**Plan your stargazing for the year's best meteor showers**")

    # Comprehensive meteor shower data for 2025
    meteor_showers = [
        {"name": "Quadrantids", "peak": "Jan 3-4", "active": "Dec 28 - Jan 12", "rate": "120", "parent": "Asteroid 2003 EH1", "best_view": "Pre-dawn", "moon": "🌓", "radiant": "Boötes", "speed": "41 km/s", "highlight": False},
        {"name": "Lyrids", "peak": "Apr 21-22", "active": "Apr 14-30", "rate": "18", "parent": "Comet Thatcher", "best_view": "Pre-dawn", "moon": "🌘", "radiant": "Lyra", "speed": "49 km/s", "highlight": False},
        {"name": "Eta Aquariids", "peak": "May 5-6", "active": "Apr 19 - May 28", "rate": "50", "parent": "Comet Halley", "best_view": "Pre-dawn", "moon": "🌓", "radiant": "Aquarius", "speed": "66 km/s", "highlight": False},
        {"name": "Delta Aquariids", "peak": "Jul 28-29", "active": "Jul 12 - Aug 23", "rate": "20", "parent": "Comet 96P/Machholz", "best_view": "After midnight", "moon": "🌑", "radiant": "Aquarius", "speed": "41 km/s", "highlight": False},
        {"name": "Perseids", "peak": "Aug 11-13", "active": "Jul 17 - Aug 24", "rate": "100", "parent": "Comet Swift-Tuttle", "best_view": "Pre-dawn", "moon": "🌕", "radiant": "Perseus", "speed": "59 km/s", "highlight": True},
        {"name": "Draconids", "peak": "Oct 8-9", "active": "Oct 6-10", "rate": "10", "parent": "Comet 21P/Giacobini-Zinner", "best_view": "Evening", "moon": "🌗", "radiant": "Draco", "speed": "20 km/s", "highlight": False},
        {"name": "Orionids", "peak": "Oct 20-21", "active": "Oct 2 - Nov 7", "rate": "20", "parent": "Comet Halley", "best_view": "After midnight", "moon": "🌘", "radiant": "Orion", "speed": "66 km/s", "highlight": False},
        {"name": "Taurids", "peak": "Nov 5-6", "active": "Sep 10 - Nov 20", "rate": "5", "parent": "Comet Encke", "best_view": "Midnight", "moon": "🌔", "radiant": "Taurus", "speed": "27 km/s", "highlight": False},
        {"name": "Leonids", "peak": "Nov 17-18", "active": "Nov 6-30", "rate": "15", "parent": "Comet Tempel-Tuttle", "best_view": "After midnight", "moon": "🌖", "radiant": "Leo", "speed": "71 km/s", "highlight": False},
        {"name": "Geminids", "peak": "Dec 13-14", "active": "Dec 4-17", "rate": "150", "parent": "Asteroid 3200 Phaethon", "best_view": "All night", "moon": "🌔", "radiant": "Gemini", "speed": "35 km/s", "highlight": True},
        {"name": "Ursids", "peak": "Dec 21-22", "active": "Dec 17-26", "rate": "10", "parent": "Comet 8P/Tuttle", "best_view": "Pre-dawn", "moon": "🌘", "radiant": "Ursa Minor", "speed": "33 km/s", "highlight": False},
    ]

    st.subheader("🌠 2025 Meteor Shower Calendar")

    # Display each shower as a card
    for shower in meteor_showers:
        is_highlight = shower["highlight"]
        bg_color = "rgba(6, 147, 227, 0.15)" if is_highlight else "rgba(99, 102, 241, 0.05)"
        border = "2px solid #0693e3" if is_highlight else "1px solid rgba(99, 102, 241, 0.2)"
        top_pick_badge = '<span style="background: #0693e3; color: white; padding: 2px 8px; border-radius: 4px; margin-left: 8px; font-size: 0.75rem;">TOP PICK</span>' if is_highlight else ""

        st.markdown(f"""
        <div style="background: {bg_color}; border: {border}; border-radius: 12px; padding: 1rem; margin: 0.5rem 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                <div>
                    <span style="font-size: 1.3rem; font-weight: bold;">☄️ {shower['name']}</span>
                    {top_pick_badge}
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #fbbf24; font-size: 1.2rem;">{shower['rate']}/hr</div>
                    <div style="font-size: 0.8rem; color: #9ca3af;">max meteors</div>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-top: 0.75rem; font-size: 0.9rem; color: #9ca3af;">
                <span>📅 Peak: {shower['peak']}</span>
                <span>🗓️ Active: {shower['active']}</span>
                <span>🕐 Best: {shower['best_view']}</span>
                <span>🌙 Moon: {shower['moon']}</span>
                <span>🎯 Radiant: {shower['radiant']}</span>
                <span>⚡ Speed: {shower['speed']}</span>
            </div>
            <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #a78bfa;">
                Parent: {shower['parent']}
            </div>
        </div>
        """, unsafe_allow_html=True)

    # Viewing tips
    st.markdown("---")
    st.subheader("👀 Meteor Viewing Tips")

    tips_cols = st.columns(3)
    tips_data = [
        ("🌑", "Dark Skies", "Get away from city lights. New Moon nights are best."),
        ("👁️", "Adapt Your Eyes", "Allow 20-30 minutes for your eyes to adjust to darkness."),
        ("🧥", "Be Comfortable", "Bring blankets, recline, and look at a wide area of sky."),
    ]
    for i, (emoji, title, desc) in enumerate(tips_data):
        with tips_cols[i]:
            st.markdown(f"""
            <div class="cosmic-card" style="text-align: center;">
                <div style="font-size: 2rem;">{emoji}</div>
                <div style="font-weight: bold;">{title}</div>
                <div style="font-size: 0.85rem; color: #9ca3af;">{desc}</div>
            </div>
            """, unsafe_allow_html=True)

    # Additional meteor shower science
    st.markdown("---")
    with st.expander("🔬 The Science of Meteor Showers"):
        st.markdown("""
        **What causes meteor showers?**
        When comets orbit the Sun, they leave behind trails of dust and debris. When Earth passes through these trails, the particles enter our atmosphere at high speeds (20-70 km/s) and burn up, creating the bright streaks we call meteors.

        **Understanding the data:**
        - **ZHR (Zenithal Hourly Rate)**: The theoretical number of meteors you'd see per hour under perfect conditions (radiant at zenith, dark sky)
        - **Radiant**: The constellation from which the meteors appear to originate
        - **Speed**: Faster meteors create brighter, longer streaks
        - **Moon Phase**: A bright Moon reduces visibility of fainter meteors

        **Famous meteor storms:**
        - 1833 Leonids: ~100,000 meteors/hour - "The night the stars fell"
        - 1966 Leonids: ~150,000 meteors/hour over Arizona
        - 2001 Leonids: ~3,000 meteors/hour worldwide
        """)


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

            # ===== NUMEROLOGY SECTION (Pro Feature Preview) =====
            st.markdown("---")
            st.markdown("### Your Cosmic Numbers")

            if check_pro_feature("Detailed Numerology", show_prompt=False):
                pass  # Pro user, show full content below
            else:
                st.info("⭐ Upgrade to Pro for detailed numerology readings and interpretations")

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


# ============== SKY BINGO PAGE (PRO FEATURE) ==============

elif page == "🎯 Sky Bingo":
    st.header("🎯 Sky Bingo Challenge")
    st.markdown("**Complete cosmic challenges and earn celestial rewards!**")

    # Check for PRO feature access
    if not check_pro_feature("Sky Bingo", show_prompt=True):
        st.warning("Sky Bingo is a PRO feature. Upgrade to unlock daily cosmic challenges!")
        st.stop()

    # ===== SKY BINGO DATA AND CONFIGURATION =====

    # Celestial objectives for bingo cards
    SKY_BINGO_OBJECTIVES = {
        # Stars
        "red_giant": {"name": "Find a Red Giant Star", "category": "Stars", "icon": "🔴", "difficulty": "Easy",
                      "hint": "Look for Betelgeuse in Orion or Aldebaran in Taurus - they have an orange-red hue!",
                      "points": 10},
        "blue_star": {"name": "Spot a Blue Giant Star", "category": "Stars", "icon": "🔵", "difficulty": "Medium",
                      "hint": "Rigel in Orion is one of the brightest blue supergiants visible to naked eye.",
                      "points": 15},
        "double_star": {"name": "Observe a Double Star", "category": "Stars", "icon": "✨", "difficulty": "Medium",
                        "hint": "Albireo in Cygnus shows beautiful gold and blue colors through binoculars.",
                        "points": 20},
        "variable_star": {"name": "Track a Variable Star", "category": "Stars", "icon": "💫", "difficulty": "Hard",
                          "hint": "Algol (the Demon Star) in Perseus dims noticeably every 2.87 days.",
                          "points": 25},
        "binary_system": {"name": "Identify a Binary System", "category": "Stars", "icon": "👯", "difficulty": "Hard",
                          "hint": "Mizar and Alcor in the Big Dipper's handle form a famous naked-eye double.",
                          "points": 20},

        # Galaxies
        "spiral_galaxy": {"name": "Spot a Spiral Galaxy", "category": "Galaxies", "icon": "🌀", "difficulty": "Medium",
                          "hint": "M31 Andromeda Galaxy is visible to naked eye in dark skies!",
                          "points": 25},
        "elliptical_galaxy": {"name": "Find an Elliptical Galaxy", "category": "Galaxies", "icon": "⚪", "difficulty": "Hard",
                               "hint": "M87 in Virgo requires a telescope but hosts a famous black hole.",
                               "points": 30},
        "galaxy_cluster": {"name": "Observe a Galaxy Cluster", "category": "Galaxies", "icon": "🌌", "difficulty": "Expert",
                           "hint": "The Virgo Cluster contains over 2000 galaxies!",
                           "points": 40},

        # Planets
        "gas_giant": {"name": "View a Gas Giant Planet", "category": "Planets", "icon": "🪐", "difficulty": "Easy",
                      "hint": "Jupiter and Saturn are bright and easy to spot when visible.",
                      "points": 10},
        "rocky_planet": {"name": "Spot a Rocky Planet", "category": "Planets", "icon": "🌍", "difficulty": "Easy",
                         "hint": "Mars (red), Venus (bright), and Mercury (near Sun) are rocky worlds.",
                         "points": 10},
        "planet_moons": {"name": "See Planetary Moons", "category": "Planets", "icon": "🌙", "difficulty": "Medium",
                         "hint": "Jupiter's 4 Galilean moons are visible through binoculars!",
                         "points": 20},
        "planet_rings": {"name": "Observe Planet Rings", "category": "Planets", "icon": "💍", "difficulty": "Medium",
                         "hint": "Saturn's rings are visible through a small telescope at 25x magnification.",
                         "points": 25},

        # Deep Sky Objects
        "nebula": {"name": "Find a Nebula", "category": "Deep Sky", "icon": "☁️", "difficulty": "Medium",
                   "hint": "The Orion Nebula (M42) is visible to naked eye below Orion's belt.",
                   "points": 20},
        "globular_cluster": {"name": "Spot a Globular Cluster", "category": "Deep Sky", "icon": "🔮", "difficulty": "Medium",
                              "hint": "M13 in Hercules is one of the brightest globular clusters.",
                              "points": 20},
        "open_cluster": {"name": "Observe an Open Cluster", "category": "Deep Sky", "icon": "✨", "difficulty": "Easy",
                         "hint": "The Pleiades (Seven Sisters) in Taurus is a beautiful open cluster.",
                         "points": 15},
        "planetary_nebula": {"name": "Find a Planetary Nebula", "category": "Deep Sky", "icon": "💠", "difficulty": "Hard",
                              "hint": "The Ring Nebula (M57) in Lyra requires a telescope.",
                              "points": 30},

        # Solar System Events
        "meteor": {"name": "Catch a Meteor", "category": "Events", "icon": "☄️", "difficulty": "Easy",
                   "hint": "Watch for 30+ minutes on a clear dark night - you'll see one!",
                   "points": 10},
        "satellite": {"name": "Track a Satellite", "category": "Events", "icon": "🛰️", "difficulty": "Easy",
                      "hint": "The ISS is bright and crosses the sky in about 5 minutes.",
                      "points": 10},
        "moon_phase": {"name": "Document Moon Phase", "category": "Events", "icon": "🌓", "difficulty": "Easy",
                       "hint": "Note the current lunar phase and compare to predictions.",
                       "points": 5},
        "conjunction": {"name": "Witness a Conjunction", "category": "Events", "icon": "🤝", "difficulty": "Medium",
                        "hint": "Two bright objects appearing close together in the sky.",
                        "points": 25},

        # Asteroids & Comets
        "asteroid": {"name": "Track an Asteroid", "category": "Small Bodies", "icon": "🪨", "difficulty": "Hard",
                     "hint": "Vesta and Ceres can reach binocular visibility at opposition.",
                     "points": 30},
        "comet": {"name": "Observe a Comet", "category": "Small Bodies", "icon": "☄️", "difficulty": "Expert",
                  "hint": "Check astronomical news for current visible comets.",
                  "points": 50},

        # Constellations
        "zodiac_const": {"name": "Identify Zodiac Constellation", "category": "Constellations", "icon": "♈", "difficulty": "Easy",
                         "hint": "Find any of the 12 zodiac constellations along the ecliptic.",
                         "points": 10},
        "circumpolar": {"name": "Find a Circumpolar Star", "category": "Constellations", "icon": "⭐", "difficulty": "Easy",
                        "hint": "Polaris (North Star) never sets for Northern Hemisphere observers.",
                        "points": 10},
        "summer_triangle": {"name": "Locate the Summer Triangle", "category": "Constellations", "icon": "🔺", "difficulty": "Easy",
                            "hint": "Vega, Deneb, and Altair form this famous asterism.",
                            "points": 15},
        "winter_hexagon": {"name": "Trace the Winter Hexagon", "category": "Constellations", "icon": "⬡", "difficulty": "Medium",
                           "hint": "Six bright stars including Rigel, Sirius, and Capella.",
                           "points": 20},

        # Advanced
        "milky_way": {"name": "Photograph the Milky Way", "category": "Advanced", "icon": "🌌", "difficulty": "Medium",
                      "hint": "Need very dark skies and a camera capable of long exposures.",
                      "points": 35},
        "aurora": {"name": "Witness an Aurora", "category": "Advanced", "icon": "🌈", "difficulty": "Expert",
                   "hint": "Monitor space weather and head to high latitudes during solar storms.",
                   "points": 50},
        "eclipse": {"name": "Observe an Eclipse", "category": "Advanced", "icon": "🌑", "difficulty": "Expert",
                    "hint": "Lunar eclipses happen 2-4 times per year. Solar eclipses are rarer locally.",
                    "points": 50},
    }

    # Badges and rewards
    SKY_BINGO_BADGES = {
        "first_bingo": {"name": "First Light", "icon": "🌟", "description": "Completed your first bingo!", "requirement": 1},
        "five_bingos": {"name": "Stargazer", "icon": "⭐", "description": "Completed 5 bingos!", "requirement": 5},
        "ten_bingos": {"name": "Night Owl", "icon": "🦉", "description": "Completed 10 bingos!", "requirement": 10},
        "twenty_bingos": {"name": "Cosmic Champion", "icon": "🏆", "description": "Completed 20 bingos!", "requirement": 20},
        "streak_3": {"name": "Consistent Observer", "icon": "🔥", "description": "3-day observation streak!", "requirement": 3},
        "streak_7": {"name": "Weekly Warrior", "icon": "💪", "description": "7-day observation streak!", "requirement": 7},
        "streak_30": {"name": "Lunar Legend", "icon": "🌙", "description": "30-day observation streak!", "requirement": 30},
        "all_categories": {"name": "Universal Observer", "icon": "🌌", "description": "Found objects in all categories!", "requirement": 7},
        "expert_hunter": {"name": "Expert Hunter", "icon": "🎯", "description": "Completed 5 expert-level objectives!", "requirement": 5},
        "100_points": {"name": "Century Club", "icon": "💯", "description": "Earned 100 points!", "requirement": 100},
        "500_points": {"name": "Star Collector", "icon": "✨", "description": "Earned 500 points!", "requirement": 500},
        "1000_points": {"name": "Celestial Master", "icon": "👑", "description": "Earned 1000 points!", "requirement": 1000},
    }

    # Titles based on total achievements
    SKY_BINGO_TITLES = [
        (0, "Novice Stargazer"),
        (50, "Amateur Astronomer"),
        (150, "Skilled Observer"),
        (300, "Expert Skywatcher"),
        (500, "Master Astronomer"),
        (800, "Celestial Navigator"),
        (1200, "Cosmic Explorer"),
        (2000, "Galactic Pioneer"),
        (3000, "Universal Observer"),
        (5000, "Legendary Astronomer"),
    ]

    # Challenge types
    CHALLENGE_TYPES = {
        "daily": {"grid_size": 9, "objectives": 9, "name": "Daily Challenge", "duration": "24 hours"},
        "weekly": {"grid_size": 16, "objectives": 16, "name": "Weekly Challenge", "duration": "7 days"},
    }

    # ===== SESSION STATE INITIALIZATION =====
    if "sky_bingo_data" not in st.session_state:
        st.session_state.sky_bingo_data = {
            "current_card": None,
            "card_type": "daily",
            "card_date": None,
            "completed_cells": [],
            "total_bingos": 0,
            "total_points": 0,
            "streak_current": 0,
            "streak_best": 0,
            "last_played_date": None,
            "badges_earned": [],
            "objectives_completed": [],
            "category_progress": {},
            "expert_completed": 0,
            "cards_completed": 0,
        }

    bingo_data = st.session_state.sky_bingo_data

    # ===== HELPER FUNCTIONS =====
    def generate_bingo_card(card_type: str, seed_date: date) -> list:
        """Generate a deterministic bingo card based on date"""
        import random
        config = CHALLENGE_TYPES[card_type]
        num_objectives = config["objectives"]

        # Use date as seed for reproducibility
        random.seed(seed_date.toordinal() + hash(card_type))

        # Select objectives with variety
        available = list(SKY_BINGO_OBJECTIVES.keys())
        selected = random.sample(available, min(num_objectives, len(available)))

        return selected

    def check_bingo(completed: list, grid_size: int) -> list:
        """Check for completed bingo lines"""
        bingos = []
        side = int(grid_size ** 0.5)

        # Rows
        for row in range(side):
            row_cells = [row * side + col for col in range(side)]
            if all(cell in completed for cell in row_cells):
                bingos.append(("row", row))

        # Columns
        for col in range(side):
            col_cells = [row * side + col for row in range(side)]
            if all(cell in completed for cell in col_cells):
                bingos.append(("col", col))

        # Diagonals
        diag1 = [i * side + i for i in range(side)]
        if all(cell in completed for cell in diag1):
            bingos.append(("diag", 0))

        diag2 = [i * side + (side - 1 - i) for i in range(side)]
        if all(cell in completed for cell in diag2):
            bingos.append(("diag", 1))

        return bingos

    def update_streak(bingo_data: dict, today: date):
        """Update streak based on last played date"""
        last_played = bingo_data.get("last_played_date")
        if last_played:
            last_date = datetime.strptime(last_played, "%Y-%m-%d").date() if isinstance(last_played, str) else last_played
            days_diff = (today - last_date).days
            if days_diff == 1:
                bingo_data["streak_current"] += 1
            elif days_diff > 1:
                bingo_data["streak_current"] = 1
        else:
            bingo_data["streak_current"] = 1

        bingo_data["streak_best"] = max(bingo_data["streak_best"], bingo_data["streak_current"])
        bingo_data["last_played_date"] = today.strftime("%Y-%m-%d")

    def get_title(points: int) -> str:
        """Get title based on points"""
        title = "Novice Stargazer"
        for threshold, name in SKY_BINGO_TITLES:
            if points >= threshold:
                title = name
        return title

    def check_new_badges(bingo_data: dict) -> list:
        """Check for newly earned badges"""
        new_badges = []
        earned = bingo_data.get("badges_earned", [])

        # Bingo count badges
        bingo_counts = {"first_bingo": 1, "five_bingos": 5, "ten_bingos": 10, "twenty_bingos": 20}
        for badge_id, req in bingo_counts.items():
            if badge_id not in earned and bingo_data["total_bingos"] >= req:
                new_badges.append(badge_id)

        # Streak badges
        streak_badges = {"streak_3": 3, "streak_7": 7, "streak_30": 30}
        for badge_id, req in streak_badges.items():
            if badge_id not in earned and bingo_data["streak_current"] >= req:
                new_badges.append(badge_id)

        # Points badges
        point_badges = {"100_points": 100, "500_points": 500, "1000_points": 1000}
        for badge_id, req in point_badges.items():
            if badge_id not in earned and bingo_data["total_points"] >= req:
                new_badges.append(badge_id)

        # Expert badge
        if "expert_hunter" not in earned and bingo_data.get("expert_completed", 0) >= 5:
            new_badges.append("expert_hunter")

        # All categories badge
        categories_found = set(bingo_data.get("category_progress", {}).keys())
        all_categories = set(obj["category"] for obj in SKY_BINGO_OBJECTIVES.values())
        if "all_categories" not in earned and categories_found == all_categories:
            new_badges.append("all_categories")

        return new_badges

    # ===== MAIN UI =====
    today = date.today()

    # Stats row
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Points", f"{bingo_data['total_points']:,}", delta=None)
    with col2:
        st.metric("Bingos", bingo_data["total_bingos"])
    with col3:
        streak_delta = f"+{bingo_data['streak_current']}" if bingo_data['streak_current'] > 0 else None
        st.metric("Current Streak", f"{bingo_data['streak_current']} days", delta=streak_delta)
    with col4:
        title = get_title(bingo_data["total_points"])
        st.metric("Title", title)

    st.markdown("---")

    # Challenge type selector
    col_type, col_info = st.columns([2, 3])
    with col_type:
        challenge_type = st.radio(
            "Choose Challenge:",
            ["daily", "weekly"],
            format_func=lambda x: CHALLENGE_TYPES[x]["name"],
            horizontal=True
        )

    with col_info:
        config = CHALLENGE_TYPES[challenge_type]
        side = int(config["grid_size"] ** 0.5)
        st.info(f"**{config['name']}**: {side}x{side} grid, valid for {config['duration']}. Complete rows, columns, or diagonals!")

    # Determine card date
    if challenge_type == "daily":
        card_date = today
    else:
        # Weekly resets on Monday
        card_date = today - timedelta(days=today.weekday())

    # Check if we need a new card
    need_new_card = (
        bingo_data["current_card"] is None or
        bingo_data["card_type"] != challenge_type or
        bingo_data["card_date"] != card_date.strftime("%Y-%m-%d")
    )

    if need_new_card:
        bingo_data["current_card"] = generate_bingo_card(challenge_type, card_date)
        bingo_data["card_type"] = challenge_type
        bingo_data["card_date"] = card_date.strftime("%Y-%m-%d")
        bingo_data["completed_cells"] = []

    current_card = bingo_data["current_card"]
    completed_cells = bingo_data["completed_cells"]
    grid_size = CHALLENGE_TYPES[challenge_type]["grid_size"]
    side = int(grid_size ** 0.5)

    # Display bingo card
    st.markdown("### Your Bingo Card")

    # Calculate expiry
    if challenge_type == "daily":
        expires = datetime.combine(today + timedelta(days=1), datetime.min.time())
    else:
        next_monday = today + timedelta(days=(7 - today.weekday()))
        expires = datetime.combine(next_monday, datetime.min.time())

    time_left = expires - datetime.now()
    hours_left = int(time_left.total_seconds() // 3600)
    mins_left = int((time_left.total_seconds() % 3600) // 60)

    st.caption(f"Card valid until: {expires.strftime('%B %d, %Y %H:%M')} ({hours_left}h {mins_left}m remaining)")

    # Check for existing bingos
    existing_bingos = check_bingo(completed_cells, grid_size)

    # Build the bingo grid
    for row in range(side):
        cols = st.columns(side)
        for col in range(side):
            cell_idx = row * side + col
            objective_key = current_card[cell_idx]
            objective = SKY_BINGO_OBJECTIVES[objective_key]
            is_completed = cell_idx in completed_cells

            # Check if this cell is part of a bingo
            is_bingo_cell = False
            for bingo_type, bingo_idx in existing_bingos:
                if bingo_type == "row" and bingo_idx == row:
                    is_bingo_cell = True
                elif bingo_type == "col" and bingo_idx == col:
                    is_bingo_cell = True
                elif bingo_type == "diag" and bingo_idx == 0 and row == col:
                    is_bingo_cell = True
                elif bingo_type == "diag" and bingo_idx == 1 and row == (side - 1 - col):
                    is_bingo_cell = True

            with cols[col]:
                # Card styling
                if is_completed:
                    bg_color = "rgba(34, 197, 94, 0.3)" if is_bingo_cell else "rgba(34, 197, 94, 0.15)"
                    border_color = "rgba(34, 197, 94, 0.8)" if is_bingo_cell else "rgba(34, 197, 94, 0.5)"
                    check_icon = "✅"
                else:
                    bg_color = "rgba(6, 147, 227, 0.1)"
                    border_color = "rgba(6, 147, 227, 0.3)"
                    check_icon = ""

                # Difficulty colors
                diff_colors = {"Easy": "#22c55e", "Medium": "#eab308", "Hard": "#f97316", "Expert": "#ef4444"}
                diff_color = diff_colors.get(objective["difficulty"], "#9ca3af")

                st.markdown(f"""
                <div style="background: {bg_color}; border: 2px solid {border_color};
                            border-radius: 10px; padding: 0.75rem; margin: 0.25rem 0;
                            min-height: 120px; text-align: center;">
                    <div style="font-size: 1.5rem;">{objective['icon']} {check_icon}</div>
                    <div style="font-size: 0.75rem; font-weight: 600; margin: 0.25rem 0;">{objective['name']}</div>
                    <div style="font-size: 0.65rem; color: {diff_color};">{objective['difficulty']}</div>
                    <div style="font-size: 0.65rem; color: #9ca3af;">{objective['points']} pts</div>
                </div>
                """, unsafe_allow_html=True)

                # Mark as found button
                if not is_completed:
                    if st.button(f"Found!", key=f"bingo_{cell_idx}", use_container_width=True):
                        # Mark as completed
                        completed_cells.append(cell_idx)
                        bingo_data["completed_cells"] = completed_cells

                        # Update stats
                        bingo_data["total_points"] += objective["points"]
                        bingo_data["objectives_completed"].append(objective_key)

                        # Track category
                        cat = objective["category"]
                        if cat not in bingo_data["category_progress"]:
                            bingo_data["category_progress"][cat] = 0
                        bingo_data["category_progress"][cat] += 1

                        # Track expert objectives
                        if objective["difficulty"] == "Expert":
                            bingo_data["expert_completed"] = bingo_data.get("expert_completed", 0) + 1

                        # Check for new bingos
                        new_bingos = check_bingo(completed_cells, grid_size)
                        if len(new_bingos) > len(existing_bingos):
                            bingo_data["total_bingos"] += len(new_bingos) - len(existing_bingos)
                            # Bonus points for bingo
                            bonus = 50 * (len(new_bingos) - len(existing_bingos))
                            bingo_data["total_points"] += bonus
                            st.success(f"BINGO! +{bonus} bonus points!")
                            st.balloons()

                        # Update streak
                        update_streak(bingo_data, today)

                        # Check for new badges
                        new_badges = check_new_badges(bingo_data)
                        for badge_id in new_badges:
                            if badge_id not in bingo_data["badges_earned"]:
                                bingo_data["badges_earned"].append(badge_id)
                                badge = SKY_BINGO_BADGES[badge_id]
                                st.success(f"New Badge Earned: {badge['icon']} {badge['name']}!")

                        st.rerun()

    # Bingo status
    if existing_bingos:
        st.success(f"You have {len(existing_bingos)} BINGO(s) on this card!")

    # Progress bar
    progress = len(completed_cells) / grid_size
    st.progress(progress, text=f"Card Progress: {len(completed_cells)}/{grid_size} objectives ({progress*100:.0f}%)")

    # Hints section
    st.markdown("---")
    with st.expander("Observation Hints"):
        hint_cols = st.columns(2)
        for i, cell_idx in enumerate(current_card):
            if cell_idx not in [current_card[c] for c in completed_cells]:
                objective = SKY_BINGO_OBJECTIVES[cell_idx]
                with hint_cols[i % 2]:
                    st.markdown(f"""
                    <div style="background: rgba(99, 102, 241, 0.1); padding: 0.5rem; border-radius: 8px; margin: 0.25rem 0;">
                        <b>{objective['icon']} {objective['name']}</b><br>
                        <span style="color: #9ca3af; font-size: 0.85rem;">{objective['hint']}</span>
                    </div>
                    """, unsafe_allow_html=True)

    # Badges section
    st.markdown("---")
    st.markdown("### Your Badges")

    earned_badges = bingo_data.get("badges_earned", [])
    if earned_badges:
        badge_cols = st.columns(4)
        for i, badge_id in enumerate(earned_badges):
            badge = SKY_BINGO_BADGES[badge_id]
            with badge_cols[i % 4]:
                st.markdown(f"""
                <div style="background: linear-gradient(135deg, rgba(212, 168, 83, 0.2), rgba(6, 147, 227, 0.2));
                            border: 1px solid rgba(212, 168, 83, 0.5); border-radius: 10px;
                            padding: 1rem; text-align: center; margin: 0.25rem 0;">
                    <div style="font-size: 2rem;">{badge['icon']}</div>
                    <div style="font-weight: 600; color: #d4a853;">{badge['name']}</div>
                    <div style="font-size: 0.75rem; color: #9ca3af;">{badge['description']}</div>
                </div>
                """, unsafe_allow_html=True)
    else:
        st.info("Complete objectives and bingos to earn badges!")

    # Available badges preview
    with st.expander("Badges to Earn"):
        avail_cols = st.columns(3)
        for i, (badge_id, badge) in enumerate(SKY_BINGO_BADGES.items()):
            if badge_id not in earned_badges:
                with avail_cols[i % 3]:
                    st.markdown(f"""
                    <div style="background: rgba(107, 114, 128, 0.1); border: 1px dashed rgba(107, 114, 128, 0.3);
                                border-radius: 10px; padding: 0.75rem; text-align: center; margin: 0.25rem 0;">
                        <div style="font-size: 1.5rem; opacity: 0.5;">{badge['icon']}</div>
                        <div style="font-weight: 500; color: #6b7280;">{badge['name']}</div>
                        <div style="font-size: 0.7rem; color: #9ca3af;">{badge['description']}</div>
                    </div>
                    """, unsafe_allow_html=True)

    # Leaderboard / Stats
    st.markdown("---")
    st.markdown("### Your Statistics")

    stat_cols = st.columns(4)
    with stat_cols[0]:
        st.markdown(f"""
        <div class="cosmic-card" style="text-align: center;">
            <div style="font-size: 2rem;">🔥</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #f97316;">{bingo_data['streak_best']}</div>
            <div style="color: #9ca3af;">Best Streak (days)</div>
        </div>
        """, unsafe_allow_html=True)

    with stat_cols[1]:
        st.markdown(f"""
        <div class="cosmic-card" style="text-align: center;">
            <div style="font-size: 2rem;">🎯</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #22c55e;">{len(bingo_data.get('objectives_completed', []))}</div>
            <div style="color: #9ca3af;">Total Objectives</div>
        </div>
        """, unsafe_allow_html=True)

    with stat_cols[2]:
        st.markdown(f"""
        <div class="cosmic-card" style="text-align: center;">
            <div style="font-size: 2rem;">🏆</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #0693e3;">{len(earned_badges)}</div>
            <div style="color: #9ca3af;">Badges Earned</div>
        </div>
        """, unsafe_allow_html=True)

    with stat_cols[3]:
        categories_found = len(bingo_data.get("category_progress", {}))
        total_categories = len(set(obj["category"] for obj in SKY_BINGO_OBJECTIVES.values()))
        st.markdown(f"""
        <div class="cosmic-card" style="text-align: center;">
            <div style="font-size: 2rem;">🌌</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #a78bfa;">{categories_found}/{total_categories}</div>
            <div style="color: #9ca3af;">Categories Explored</div>
        </div>
        """, unsafe_allow_html=True)

    # Category progress
    st.markdown("### Category Progress")
    cat_progress = bingo_data.get("category_progress", {})
    if cat_progress:
        cat_cols = st.columns(len(cat_progress) if len(cat_progress) <= 4 else 4)
        for i, (cat, count) in enumerate(cat_progress.items()):
            with cat_cols[i % 4]:
                st.metric(cat, count)
    else:
        st.info("Start completing objectives to see your category progress!")

    # Share section
    st.markdown("---")
    st.subheader("Share Your Progress")

    share_text = f"""Sky Bingo Challenge Progress!

Points: {bingo_data['total_points']:,}
Bingos: {bingo_data['total_bingos']}
Streak: {bingo_data['streak_current']} days
Title: {get_title(bingo_data['total_points'])}
Badges: {len(earned_badges)}

Join me in the cosmic challenge!
#SkyBingo #AstroData #Astronomy"""

    st.text_area("Copy & Share:", value=share_text, height=200)

    # Tips
    st.markdown("---")
    with st.expander("Observation Tips"):
        st.markdown("""
        **Getting Started:**
        - Start with Easy objectives to build your streak
        - Use binoculars for many Deep Sky objectives
        - Check tonight's sky conditions before observing

        **Equipment Needed:**
        - **Naked Eye**: Constellations, bright planets, meteors, Moon phases
        - **Binoculars**: Double stars, open clusters, Jupiter's moons
        - **Telescope**: Planetary nebulae, galaxies, Saturn's rings

        **Best Practices:**
        - Let your eyes adapt to darkness for 20-30 minutes
        - Use a red flashlight to preserve night vision
        - Check astronomical apps for object positions
        - Join local astronomy clubs for group observations

        **Honor System:**
        This game operates on the honor system - mark items as found when you've genuinely observed them.
        The real reward is the wonder of the cosmos!
        """)


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


# ============== MY SKY DATA PAGE (Scientific) ==============

elif page == "📊 My Sky Data":
    st.header("📊 My Sky Data")
    st.markdown("**Scientific view of celestial positions - no astrological interpretations**")

    st.info("🔬 This page shows actual astronomical data for your birth date and location. These are scientific measurements based on celestial mechanics.")

    # Input section
    col1, col2 = st.columns([1, 2])

    with col1:
        st.subheader("Your Data")
        sky_name = st.text_input("Your Name:", value=profile_name if profile_name != "Cosmic Explorer" else "")
        sky_date = st.date_input("Date:", value=profile_birth_date)
        sky_time = st.time_input("Time (local):", value=profile_birth_time)
        sky_location = st.selectbox(
            "Location:",
            list(LOCATIONS.keys()),
            format_func=lambda x: LOCATIONS[x]["name"],
            index=list(LOCATIONS.keys()).index("mumbai") if "mumbai" in LOCATIONS else 0,
            key="sky_data_location"
        )

        sky_lat = LOCATIONS[sky_location]["lat"]
        sky_lon = LOCATIONS[sky_location]["lon"]
        sky_place = LOCATIONS[sky_location]["name"]
        sky_country = LOCATIONS[sky_location]["country"]
        tz_offset = get_timezone_offset(sky_country)

    with col2:
        if sky_name:
            # Calculate positions
            sky_datetime = datetime.combine(sky_date, sky_time)
            sky_positions = get_all_planetary_positions(sky_datetime, sky_lat, sky_lon, sky_country)

            st.markdown(f"""
            <div class="cosmic-card">
                <h3 style="text-align: center;">🔭 Astronomical Snapshot</h3>
                <div style="text-align: center; color: #9ca3af;">
                    {sky_date.strftime('%B %d, %Y')} at {sky_time.strftime('%H:%M')} local time<br>
                    📍 {sky_place} (UTC{'+' if tz_offset >= 0 else ''}{tz_offset})
                </div>
            </div>
            """, unsafe_allow_html=True)

            # Sun and Moon - Scientific
            st.markdown("### Solar & Lunar Positions")
            col_s1, col_s2 = st.columns(2)

            with col_s1:
                sun_pos = sky_positions["Sun"]
                st.markdown(f"""
                <div class="cosmic-card" style="text-align: center;">
                    <div style="font-size: 2.5rem;">☀️</div>
                    <div style="color: #fbbf24;"><b>Sun</b></div>
                    <div style="font-size: 1.3rem;">{sun_pos['tropical']:.2f}°</div>
                    <div style="color: #9ca3af;">Ecliptic Longitude</div>
                    <div style="color: #9ca3af; font-size: 0.8rem; margin-top: 0.5rem;">
                        In direction of: {sun_pos['sign']['name']} constellation<br>
                        Distance: ~93 million miles
                    </div>
                </div>
                """, unsafe_allow_html=True)

            with col_s2:
                moon_pos = sky_positions["Moon"]
                # Calculate moon phase
                sun_lon = sky_positions["Sun"]["tropical"]
                moon_lon = sky_positions["Moon"]["tropical"]
                phase_angle = (moon_lon - sun_lon) % 360
                if phase_angle < 45:
                    moon_phase = "New Moon"
                elif phase_angle < 90:
                    moon_phase = "Waxing Crescent"
                elif phase_angle < 135:
                    moon_phase = "First Quarter"
                elif phase_angle < 180:
                    moon_phase = "Waxing Gibbous"
                elif phase_angle < 225:
                    moon_phase = "Full Moon"
                elif phase_angle < 270:
                    moon_phase = "Waning Gibbous"
                elif phase_angle < 315:
                    moon_phase = "Last Quarter"
                else:
                    moon_phase = "Waning Crescent"

                st.markdown(f"""
                <div class="cosmic-card" style="text-align: center;">
                    <div style="font-size: 2.5rem;">🌙</div>
                    <div style="color: #c0c0c0;"><b>Moon</b></div>
                    <div style="font-size: 1.3rem;">{moon_pos['tropical']:.2f}°</div>
                    <div style="color: #9ca3af;">Ecliptic Longitude</div>
                    <div style="color: #9ca3af; font-size: 0.8rem; margin-top: 0.5rem;">
                        Phase: {moon_phase}<br>
                        Distance: ~238,855 miles
                    </div>
                </div>
                """, unsafe_allow_html=True)

            # All planets table - Scientific
            st.markdown("---")
            st.markdown("### Planetary Positions (Ecliptic Coordinates)")
            st.caption("Measured in degrees along the ecliptic from the Vernal Equinox (0° point)")

            planet_info = {
                "Sun": {"type": "Star", "note": "Center of solar system"},
                "Moon": {"type": "Natural Satellite", "note": "Earth's only moon"},
                "Mercury": {"type": "Terrestrial Planet", "note": "Smallest planet"},
                "Venus": {"type": "Terrestrial Planet", "note": "Hottest planet"},
                "Mars": {"type": "Terrestrial Planet", "note": "The Red Planet"},
                "Jupiter": {"type": "Gas Giant", "note": "Largest planet"},
                "Saturn": {"type": "Gas Giant", "note": "Famous rings"},
            }

            science_table = []
            for planet in ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"]:
                pos = sky_positions[planet]
                info = planet_info[planet]
                science_table.append({
                    "Body": f"{PLANETS[planet]['symbol']} {planet}",
                    "Type": info["type"],
                    "Ecliptic Longitude": f"{pos['tropical']:.4f}°",
                    "Constellation Direction": pos['sign']['name'],
                    "Note": info["note"]
                })
            st.dataframe(pd.DataFrame(science_table), use_container_width=True, hide_index=True)

            # Educational content
            st.markdown("---")
            st.markdown("### 📚 What This Data Means")

            col_edu1, col_edu2 = st.columns(2)
            with col_edu1:
                st.markdown("""
                <div class="cosmic-card">
                    <h4>🌍 Ecliptic Longitude</h4>
                    <p>The ecliptic is the apparent path the Sun traces across the sky over a year.
                    We measure planetary positions in degrees (0° to 360°) along this path.</p>
                    <p><b>0°</b> = Vernal Equinox point (where Sun is on March 20-21)</p>
                </div>
                """, unsafe_allow_html=True)

            with col_edu2:
                st.markdown("""
                <div class="cosmic-card">
                    <h4>🔭 Constellation Direction</h4>
                    <p>When we say a planet is "in" a constellation, we mean it appears
                    in that direction from Earth's viewpoint. The planet isn't physically
                    near those stars - they're billions of miles apart.</p>
                </div>
                """, unsafe_allow_html=True)

            # Daylight info
            st.markdown("---")
            st.markdown("### ☀️ Daylight Information")

            # Approximate daylight calculation
            day_of_year = sky_date.timetuple().tm_yday
            # Simplified daylight calculation
            declination = 23.45 * math.sin(math.radians((360/365) * (day_of_year - 81)))
            lat_rad = math.radians(sky_lat)
            dec_rad = math.radians(declination)

            try:
                hour_angle = math.acos(-math.tan(lat_rad) * math.tan(dec_rad))
                daylight_hours = 2 * math.degrees(hour_angle) / 15
            except:
                daylight_hours = 12  # Default for edge cases

            col_day1, col_day2, col_day3 = st.columns(3)
            with col_day1:
                st.metric("Approx. Daylight", f"{daylight_hours:.1f} hours")
            with col_day2:
                st.metric("Night Hours", f"{24 - daylight_hours:.1f} hours")
            with col_day3:
                season = "Spring" if 80 <= day_of_year < 172 else "Summer" if 172 <= day_of_year < 266 else "Autumn" if 266 <= day_of_year < 355 else "Winter"
                if sky_lat < 0:  # Southern hemisphere
                    season = {"Spring": "Autumn", "Summer": "Winter", "Autumn": "Spring", "Winter": "Summer"}[season]
                st.metric("Season", season)

        else:
            st.info("👆 Enter your name to see your astronomical sky data!")


# ============== REST OF THE PAGES (same as before, using user_lat, user_lon, user_name) ==============

elif page == "🕰️ Cosmic Time Machine":
    st.header("🕰️ Cosmic Time Machine")
    st.markdown("**What did the sky look like on the most important days in history?**")

    col1, col2 = st.columns([1, 2])

    with col1:
        time_choice = st.radio("Choose:", ["Historical Event", "My Birthday", "Custom Date"])

        if time_choice == "Historical Event":
            # Filter out ancient history dates that can't be displayed
            valid_events = {k: v for k, v in HISTORICAL_EVENTS.items() if v["date"].year > 0}

            # Group events by category
            categories = set(e.get("category", "Other") for e in valid_events.values())
            selected_category = st.selectbox("Category:", sorted(categories))
            filtered_events = {k: v for k, v in valid_events.items() if v.get("category") == selected_category}

            event = st.selectbox("Select event:", list(filtered_events.keys()))
            selected_date = HISTORICAL_EVENTS[event]["date"]
            event_desc = HISTORICAL_EVENTS[event]["desc"]
            st.info(f"📅 {selected_date.strftime('%B %d, %Y')}")
            st.caption(event_desc)
        elif time_choice == "My Birthday":
            selected_date = st.date_input("Your birthday:", value=date(2000, 1, 1))
            event_desc = "Your special day!"
        else:
            selected_date = st.date_input("Pick any date:", value=date(1969, 7, 20))
            event_desc = "A moment in history"

        st.markdown(f"**📍 Viewing from:** {user_name}")

        # Calculate age of the date
        years_ago = datetime.now().year - selected_date.year
        st.markdown(f"*{years_ago} years ago*")

    with col2:
        st.subheader(f"The Sky on {selected_date.strftime('%B %d, %Y')}")

        # Calculate planetary positions for that date
        selected_datetime = datetime.combine(selected_date, datetime.strptime("21:00", "%H:%M").time())
        historical_positions = get_all_planetary_positions(selected_datetime, user_lat, user_lon, "United States")

        # Moon phase calculation
        moon_lon = historical_positions["Moon"]["tropical"]
        sun_lon = historical_positions["Sun"]["tropical"]
        phase_angle = (moon_lon - sun_lon) % 360
        if phase_angle < 45:
            moon_phase = "🌑 New Moon"
        elif phase_angle < 90:
            moon_phase = "🌒 Waxing Crescent"
        elif phase_angle < 135:
            moon_phase = "🌓 First Quarter"
        elif phase_angle < 180:
            moon_phase = "🌔 Waxing Gibbous"
        elif phase_angle < 225:
            moon_phase = "🌕 Full Moon"
        elif phase_angle < 270:
            moon_phase = "🌖 Waning Gibbous"
        elif phase_angle < 315:
            moon_phase = "🌗 Last Quarter"
        else:
            moon_phase = "🌘 Waning Crescent"

        # Display key info
        st.markdown(f"""
        <div class="cosmic-card">
            <h4>🌙 Moon Phase: {moon_phase}</h4>
            <p class="insight-text">
            On this night in <b>{user_name}</b>...<br><br>
            The light from <b>Sirius</b> (8.6 ly away) reaching Earth that night
            left the star around <b>{int(selected_date.year - 8.6)}</b>.<br><br>
            Light from <b>Andromeda Galaxy</b> began its journey <b>2.5 million years ago</b>!
            </p>
        </div>
        """, unsafe_allow_html=True)

        # Planetary Positions
        st.markdown("---")
        st.markdown("### 🪐 Planetary Positions")

        planet_cols = st.columns(4)
        planets_display = [
            ("☀️", "Sun", historical_positions["Sun"]["sign"]["name"]),
            ("🌙", "Moon", historical_positions["Moon"]["sign"]["name"]),
            ("☿", "Mercury", historical_positions["Mercury"]["sign"]["name"]),
            ("♀", "Venus", historical_positions["Venus"]["sign"]["name"]),
            ("♂", "Mars", historical_positions["Mars"]["sign"]["name"]),
            ("♃", "Jupiter", historical_positions["Jupiter"]["sign"]["name"]),
            ("♄", "Saturn", historical_positions["Saturn"]["sign"]["name"]),
        ]

        for i, (symbol, name, constellation) in enumerate(planets_display):
            with planet_cols[i % 4]:
                st.markdown(f"""
                <div style="text-align: center; padding: 0.5rem; background: rgba(99,102,241,0.1); border-radius: 8px; margin: 0.25rem 0;">
                    <div style="font-size: 1.5rem;">{symbol}</div>
                    <div style="font-weight: bold;">{name}</div>
                    <div style="font-size: 0.8rem; color: #9ca3af;">in {constellation}</div>
                </div>
                """, unsafe_allow_html=True)

        # Light travel context
        st.markdown("---")
        st.markdown("### ✨ Light's Journey That Night")

        light_context = [
            ("Sirius", 8.6, selected_date.year - 9),
            ("Vega", 25, selected_date.year - 25),
            ("Arcturus", 37, selected_date.year - 37),
            ("Polaris", 433, selected_date.year - 433),
            ("Betelgeuse", 700, selected_date.year - 700),
        ]

        for star, dist, origin_year in light_context:
            st.markdown(f"- **{star}** ({dist} ly): Light left in **{origin_year}** (approximately)")

        # Visible deep sky objects
        st.markdown("---")
        st.markdown("### 🔭 Visible Deep Sky Objects")

        visible = []
        for key, obj in DEEP_SKY_OBJECTS.items():
            alt = calculate_altitude(obj["dec"], user_lat)
            if alt > 10:
                _, era = get_light_travel_events(obj["distance_ly"])
                visible.append({
                    "Object": obj["name"],
                    "Type": obj["type"],
                    "Distance": f"{obj['distance_ly']:,} ly",
                    "Light Origin": era
                })

        if visible:
            st.dataframe(pd.DataFrame(visible), use_container_width=True, hide_index=True)
        else:
            st.info("No major deep sky objects visible from your location tonight.")

        # Fun fact based on the year
        st.markdown("---")
        with st.expander("📚 What Was Happening in the Sky?"):
            year = selected_date.year

            # Determine seasonal info
            month = selected_date.month
            if user_lat > 0:  # Northern hemisphere
                if month in [12, 1, 2]:
                    season = "Winter"
                    sky_note = "Orion dominates the southern sky. Look for the brilliant stars Betelgeuse and Rigel."
                elif month in [3, 4, 5]:
                    season = "Spring"
                    sky_note = "The Big Dipper is high overhead. Follow the arc to Arcturus, the brightest star in the northern sky."
                elif month in [6, 7, 8]:
                    season = "Summer"
                    sky_note = "The Milky Way stretches across the sky. The Summer Triangle (Vega, Deneb, Altair) shines bright."
                else:
                    season = "Fall"
                    sky_note = "The Great Square of Pegasus rises in the east. Andromeda Galaxy is well-placed for viewing."
            else:  # Southern hemisphere (seasons reversed)
                if month in [12, 1, 2]:
                    season = "Summer"
                    sky_note = "The Southern Cross is high. The Magellanic Clouds are prominent."
                elif month in [3, 4, 5]:
                    season = "Fall"
                    sky_note = "Omega Centauri, the brightest globular cluster, is well-placed for viewing."
                elif month in [6, 7, 8]:
                    season = "Winter"
                    sky_note = "Scorpius and Sagittarius with the Milky Way's center dominate the sky."
                else:
                    season = "Spring"
                    sky_note = "The Magellanic Clouds are rising. The southern Milky Way is stunning."

            st.markdown(f"""
            **Season:** {season}

            **Sky Highlights:** {sky_note}

            **Historical Context:**
            - On this date, anyone looking up would have seen essentially the same stars we see today
            - The constellations have remained recognizable for thousands of years
            - Only the planets would have been in different positions
            """)


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


elif page == "🎮 Planet Hunter":
    st.header("🎮 Planet Hunter - Exoplanet Discovery Game")

    # PRO feature check
    if not check_pro_feature("Planet Hunter Game"):
        st.warning("Planet Hunter is a PRO feature. Upgrade to unlock the full game experience!")
        st.info("With Planet Hunter PRO, you can:")
        st.markdown("""
        - Discover and claim unlimited exoplanets
        - Build your personal planet collection
        - Track your discovery statistics
        - Compete on the leaderboard
        """)
    else:
        # Initialize session state for Planet Hunter game
        if "planet_hunter" not in st.session_state:
            st.session_state["planet_hunter"] = {
                "discoveries": [],
                "claimed_planets": [],
                "discovery_count": 0,
                "current_planet": None
            }

        # NASA Exoplanet Archive-style data generator
        # Based on real distributions from confirmed exoplanets
        def generate_exoplanet():
            """Generate a realistic exoplanet based on NASA Exoplanet Archive distributions."""
            import random

            # Star types with realistic distributions
            star_types = [
                {"type": "M", "temp_range": (2400, 3700), "mass_range": (0.08, 0.45), "color": "#FF6B6B", "prob": 0.76},
                {"type": "K", "temp_range": (3700, 5200), "mass_range": (0.45, 0.8), "color": "#FFA94D", "prob": 0.12},
                {"type": "G", "temp_range": (5200, 6000), "mass_range": (0.8, 1.04), "color": "#FFE066", "prob": 0.08},
                {"type": "F", "temp_range": (6000, 7500), "mass_range": (1.04, 1.4), "color": "#FFFAE6", "prob": 0.03},
                {"type": "A", "temp_range": (7500, 10000), "mass_range": (1.4, 2.1), "color": "#E6F7FF", "prob": 0.006},
                {"type": "B", "temp_range": (10000, 30000), "mass_range": (2.1, 16), "color": "#91D5FF", "prob": 0.003},
            ]

            # Select star type based on probability
            rand = random.random()
            cumulative = 0
            selected_star = star_types[0]
            for star in star_types:
                cumulative += star["prob"]
                if rand <= cumulative:
                    selected_star = star
                    break

            # Generate star properties
            star_temp = random.randint(selected_star["temp_range"][0], selected_star["temp_range"][1])
            star_mass = random.uniform(selected_star["mass_range"][0], selected_star["mass_range"][1])

            # Star naming conventions (like Kepler, TESS, K2, TOI)
            prefixes = ["Kepler", "TESS", "K2", "TOI", "HD", "GJ", "WASP", "HAT-P", "TrES", "CoRoT", "XO"]
            star_name = f"{random.choice(prefixes)}-{random.randint(1, 9999)}"

            # Planet letter
            planet_letters = ["b", "c", "d", "e", "f", "g", "h"]
            planet_letter = random.choice(planet_letters[:4])  # Most systems have fewer planets
            planet_name = f"{star_name} {planet_letter}"

            # Orbital period (days) - log-normal distribution, most are short period
            orbital_period = np.random.lognormal(mean=2.5, sigma=1.5)
            orbital_period = min(max(orbital_period, 0.5), 10000)  # Clamp to realistic range

            # Planet radius (Earth radii) - bimodal distribution
            if random.random() < 0.6:
                # Super-Earths and sub-Neptunes (most common)
                radius = np.random.lognormal(mean=0.5, sigma=0.5)
                radius = min(max(radius, 0.5), 4)
            else:
                # Gas giants
                radius = np.random.lognormal(mean=2.3, sigma=0.4)
                radius = min(max(radius, 4), 25)

            # Planet mass (Earth masses) - correlated with radius
            if radius < 1.5:
                # Rocky planets: M ~ R^3.7
                mass = (radius ** 3.7) * random.uniform(0.8, 1.2)
            elif radius < 4:
                # Sub-Neptunes: M ~ R^1.3
                mass = (radius ** 1.3) * 2 * random.uniform(0.8, 1.5)
            else:
                # Gas giants: more varied
                mass = (radius ** 2) * 10 * random.uniform(0.5, 3)
            mass = min(max(mass, 0.1), 5000)

            # Calculate equilibrium temperature
            # T_eq = T_star * sqrt(R_star / (2 * a)) * (1 - albedo)^0.25
            # Simplified: use orbital period and star temp
            semi_major_axis = ((orbital_period / 365.25) ** 2 * star_mass) ** (1/3)  # AU
            if semi_major_axis > 0:
                eq_temp = star_temp * (0.25 / semi_major_axis) ** 0.5
            else:
                eq_temp = 300
            eq_temp = min(max(eq_temp, 50), 3000)

            # Distance from Earth (light years)
            distance = np.random.lognormal(mean=5.5, sigma=1.2)
            distance = min(max(distance, 4), 10000)

            # Discovery year (weighted towards recent years)
            base_year = 1995
            years_elapsed = datetime.now().year - base_year
            discovery_year = base_year + int(random.triangular(0, years_elapsed, years_elapsed * 0.8))

            # Discovery method
            methods = [
                ("Transit", 0.75),
                ("Radial Velocity", 0.18),
                ("Direct Imaging", 0.03),
                ("Microlensing", 0.02),
                ("Transit Timing", 0.015),
                ("Astrometry", 0.005)
            ]
            method = random.choices([m[0] for m in methods], weights=[m[1] for m in methods])[0]

            return {
                "name": planet_name,
                "host_star": star_name,
                "star_type": selected_star["type"],
                "star_temp": star_temp,
                "star_color": selected_star["color"],
                "orbital_period": round(orbital_period, 2),
                "radius": round(radius, 2),
                "mass": round(mass, 2),
                "eq_temperature": round(eq_temp, 0),
                "distance_ly": round(distance, 1),
                "discovery_year": discovery_year,
                "discovery_method": method,
                "semi_major_axis": round(semi_major_axis, 3)
            }

        def calculate_habitability_score(planet):
            """Calculate a habitability score (0-100) based on multiple factors."""
            score = 0

            # Temperature factor (optimal: 200-320 K for liquid water)
            temp = planet["eq_temperature"]
            if 273 <= temp <= 373:  # 0-100C
                score += 35
            elif 200 <= temp <= 273 or 373 <= temp <= 400:
                score += 25
            elif 150 <= temp <= 200 or 400 <= temp <= 500:
                score += 10
            else:
                score += 0

            # Size factor (optimal: 0.5-2 Earth radii for rocky)
            radius = planet["radius"]
            if 0.8 <= radius <= 1.5:
                score += 25
            elif 0.5 <= radius <= 0.8 or 1.5 <= radius <= 2.0:
                score += 18
            elif 0.3 <= radius <= 0.5 or 2.0 <= radius <= 2.5:
                score += 10
            else:
                score += 0

            # Star type factor (K and early M stars are best for habitability)
            star_type = planet["star_type"]
            if star_type == "K":
                score += 20
            elif star_type == "G":
                score += 18
            elif star_type == "M":
                score += 12  # M dwarfs have flare issues
            elif star_type == "F":
                score += 8
            else:
                score += 2

            # Orbital period factor (not too short, not too long)
            period = planet["orbital_period"]
            if 100 <= period <= 500:
                score += 15
            elif 30 <= period <= 100 or 500 <= period <= 1000:
                score += 10
            elif 10 <= period <= 30 or 1000 <= period <= 2000:
                score += 5
            else:
                score += 2

            # Mass factor (affects gravity and atmosphere retention)
            mass = planet["mass"]
            if 0.5 <= mass <= 3:
                score += 5
            elif 0.1 <= mass <= 0.5 or 3 <= mass <= 10:
                score += 3
            else:
                score += 0

            return min(score, 100)

        def get_habitability_class(score):
            """Get habitability classification based on score."""
            if score >= 80:
                return ("Prime Candidate", "#22C55E", "Excellent conditions for potential life")
            elif score >= 60:
                return ("Promising", "#84CC16", "Good habitability potential")
            elif score >= 40:
                return ("Moderate", "#EAB308", "Some favorable conditions")
            elif score >= 20:
                return ("Challenging", "#F97316", "Harsh but not impossible")
            else:
                return ("Hostile", "#EF4444", "Unlikely to support life as we know it")

        # Game interface
        st.markdown("""
        <div class="cosmic-card">
            <p style="margin: 0; color: #9ca3af;">
                Welcome to Planet Hunter! Explore the cosmos and discover new exoplanets.
                Each discovery adds to your collection. Find habitable worlds and become a legendary planet hunter!
            </p>
        </div>
        """, unsafe_allow_html=True)

        # Stats row
        col_stat1, col_stat2, col_stat3, col_stat4 = st.columns(4)
        with col_stat1:
            st.metric("Discoveries", st.session_state["planet_hunter"]["discovery_count"])
        with col_stat2:
            st.metric("Claimed Planets", len(st.session_state["planet_hunter"]["claimed_planets"]))
        with col_stat3:
            habitable_count = len([p for p in st.session_state["planet_hunter"]["claimed_planets"]
                                  if calculate_habitability_score(p) >= 60])
            st.metric("Habitable Worlds", habitable_count)
        with col_stat4:
            if st.session_state["planet_hunter"]["claimed_planets"]:
                avg_score = np.mean([calculate_habitability_score(p)
                                    for p in st.session_state["planet_hunter"]["claimed_planets"]])
                st.metric("Avg Habitability", f"{avg_score:.0f}%")
            else:
                st.metric("Avg Habitability", "N/A")

        st.markdown("---")

        # Discovery section
        col_discover, col_details = st.columns([1, 2])

        with col_discover:
            st.subheader("Scan for Exoplanets")

            if st.button("Scan the Cosmos", use_container_width=True, type="primary"):
                new_planet = generate_exoplanet()
                st.session_state["planet_hunter"]["current_planet"] = new_planet
                st.session_state["planet_hunter"]["discovery_count"] += 1
                st.rerun()

            st.caption("Each scan discovers a new exoplanet based on real astronomical distributions.")

            # Quick actions
            if st.session_state["planet_hunter"]["current_planet"]:
                planet = st.session_state["planet_hunter"]["current_planet"]
                hab_score = calculate_habitability_score(planet)

                st.markdown("---")

                # Check if already claimed
                is_claimed = any(p["name"] == planet["name"]
                               for p in st.session_state["planet_hunter"]["claimed_planets"])

                if not is_claimed:
                    if st.button("Claim This Planet", use_container_width=True):
                        st.session_state["planet_hunter"]["claimed_planets"].append(planet)
                        st.success(f"Claimed {planet['name']}!")
                        st.rerun()
                else:
                    st.info("Already in your collection!")

        with col_details:
            if st.session_state["planet_hunter"]["current_planet"]:
                planet = st.session_state["planet_hunter"]["current_planet"]
                hab_score = calculate_habitability_score(planet)
                hab_class, hab_color, hab_desc = get_habitability_class(hab_score)

                st.subheader(f"Discovery: {planet['name']}")

                # Planet visualization card
                st.markdown(f"""
                <div class="cosmic-card" style="text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: 0.5rem;">&#127754;</div>
                    <h2 style="margin: 0; color: #ffffff;">{planet['name']}</h2>
                    <p style="color: {planet['star_color']}; margin: 0.5rem 0;">
                        Host Star: {planet['host_star']} ({planet['star_type']}-type)
                    </p>
                    <div style="background: linear-gradient(90deg, {hab_color}22, {hab_color}44);
                                border: 1px solid {hab_color}; border-radius: 8px;
                                padding: 0.75rem; margin-top: 1rem;">
                        <span style="font-size: 1.5rem; font-weight: bold; color: {hab_color};">
                            Habitability: {hab_score}%
                        </span>
                        <br>
                        <span style="color: {hab_color};">{hab_class}</span>
                        <br>
                        <small style="color: #9ca3af;">{hab_desc}</small>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                # Detailed properties
                st.markdown("#### Planet Properties")
                prop_col1, prop_col2 = st.columns(2)

                with prop_col1:
                    st.markdown(f"""
                    <div class="cosmic-card">
                        <p><b>Orbital Period:</b> {planet['orbital_period']:.1f} days</p>
                        <p><b>Radius:</b> {planet['radius']:.2f} Earth radii</p>
                        <p><b>Mass:</b> {planet['mass']:.2f} Earth masses</p>
                    </div>
                    """, unsafe_allow_html=True)

                with prop_col2:
                    st.markdown(f"""
                    <div class="cosmic-card">
                        <p><b>Temperature:</b> {planet['eq_temperature']:.0f} K ({planet['eq_temperature'] - 273:.0f} C)</p>
                        <p><b>Distance:</b> {planet['distance_ly']:.1f} light-years</p>
                        <p><b>Discovery Method:</b> {planet['discovery_method']}</p>
                    </div>
                    """, unsafe_allow_html=True)

                # Star information
                st.markdown("#### Host Star")
                st.markdown(f"""
                <div class="cosmic-card">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 50px; height: 50px; border-radius: 50%;
                                    background: radial-gradient(circle, {planet['star_color']}, {planet['star_color']}88);
                                    box-shadow: 0 0 20px {planet['star_color']}66;"></div>
                        <div>
                            <b>{planet['host_star']}</b> ({planet['star_type']}-type star)<br>
                            <small style="color: #9ca3af;">Temperature: {planet['star_temp']:,} K</small>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
            else:
                st.info("Click 'Scan the Cosmos' to discover your first exoplanet!")

        # Collection section
        st.markdown("---")
        st.subheader("Your Planet Collection")

        if st.session_state["planet_hunter"]["claimed_planets"]:
            # Sort options
            sort_option = st.selectbox(
                "Sort by:",
                ["Discovery Order", "Habitability (High to Low)", "Distance (Near to Far)", "Size (Large to Small)"]
            )

            planets = st.session_state["planet_hunter"]["claimed_planets"].copy()

            if sort_option == "Habitability (High to Low)":
                planets.sort(key=lambda p: calculate_habitability_score(p), reverse=True)
            elif sort_option == "Distance (Near to Far)":
                planets.sort(key=lambda p: p["distance_ly"])
            elif sort_option == "Size (Large to Small)":
                planets.sort(key=lambda p: p["radius"], reverse=True)

            # Display collection as cards
            cols = st.columns(3)
            for i, planet in enumerate(planets):
                with cols[i % 3]:
                    hab_score = calculate_habitability_score(planet)
                    hab_class, hab_color, _ = get_habitability_class(hab_score)

                    st.markdown(f"""
                    <div class="cosmic-card" style="text-align: center; min-height: 220px;">
                        <div style="font-size: 2rem;">&#127754;</div>
                        <h4 style="margin: 0.5rem 0; color: #ffffff; font-size: 0.9rem;">{planet['name']}</h4>
                        <p style="color: {planet['star_color']}; font-size: 0.75rem; margin: 0;">
                            {planet['host_star']}
                        </p>
                        <div style="margin: 0.5rem 0;">
                            <span style="background: {hab_color}33; color: {hab_color};
                                        padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                                {hab_score}% - {hab_class}
                            </span>
                        </div>
                        <small style="color: #6b7280;">
                            {planet['radius']:.1f} R_Earth | {planet['distance_ly']:.0f} ly | {planet['eq_temperature'] - 273:.0f} C
                        </small>
                    </div>
                    """, unsafe_allow_html=True)

            # Export collection
            st.markdown("---")
            if st.button("Export Collection to CSV"):
                collection_data = []
                for p in st.session_state["planet_hunter"]["claimed_planets"]:
                    collection_data.append({
                        "Planet Name": p["name"],
                        "Host Star": p["host_star"],
                        "Star Type": p["star_type"],
                        "Orbital Period (days)": p["orbital_period"],
                        "Radius (Earth)": p["radius"],
                        "Mass (Earth)": p["mass"],
                        "Temperature (K)": p["eq_temperature"],
                        "Distance (ly)": p["distance_ly"],
                        "Habitability Score": calculate_habitability_score(p),
                        "Discovery Method": p["discovery_method"]
                    })
                df = pd.DataFrame(collection_data)
                csv = df.to_csv(index=False)
                st.download_button(
                    label="Download CSV",
                    data=csv,
                    file_name="my_exoplanet_collection.csv",
                    mime="text/csv"
                )
        else:
            st.info("You haven't claimed any planets yet. Start scanning to build your collection!")

        # Fun facts section
        st.markdown("---")
        st.markdown("### Did You Know?")
        facts = [
            "The first exoplanet orbiting a Sun-like star was discovered in 1995 (51 Pegasi b).",
            "NASA's Kepler mission discovered over 2,600 confirmed exoplanets.",
            "The TRAPPIST-1 system has 7 Earth-sized planets, with 3 in the habitable zone.",
            "Some exoplanets orbit so close to their stars that their years last only a few hours!",
            "Hot Jupiters can have surface temperatures over 2,000 C - hot enough to vaporize iron.",
            "The nearest known exoplanet is Proxima Centauri b, just 4.24 light-years away.",
            "Some exoplanets may have diamond rain due to extreme pressure and carbon content.",
            "Over 5,500 exoplanets have been confirmed as of 2024, with thousands more candidates."
        ]

        import random
        selected_facts = random.sample(facts, min(3, len(facts)))
        for fact in selected_facts:
            st.markdown(f"""
            <div class="cosmic-card" style="padding: 0.75rem;">
                <p style="margin: 0; color: #d4a853;">Fact: {fact}</p>
            </div>
            """, unsafe_allow_html=True)


# ============== STAR HUNTER (PRO FEATURE) ==============
elif page == "🔭 Star Hunter":
    st.header("🔭 Star Hunter")
    st.markdown("**Discover unexplored stars from the Gaia Catalog!**")

    # Initialize Star Hunter session state
    if "star_hunter_discoveries" not in st.session_state:
        st.session_state["star_hunter_discoveries"] = []
    if "star_hunter_current_star" not in st.session_state:
        st.session_state["star_hunter_current_star"] = None
    if "star_hunter_total_scans" not in st.session_state:
        st.session_state["star_hunter_total_scans"] = 0

    # Simulated Gaia-like star database (based on real Gaia DR3 data patterns)
    GAIA_STAR_POOL = [
        {"spectral": "G2V", "temp_range": (5700, 5900), "mag_range": (4.5, 6.5), "dist_range": (10, 100), "color": "#FFF5E0", "type": "Yellow Dwarf", "rarity": "common"},
        {"spectral": "K5V", "temp_range": (4200, 4500), "mag_range": (6.0, 8.0), "dist_range": (15, 150), "color": "#FFD4A0", "type": "Orange Dwarf", "rarity": "common"},
        {"spectral": "M2V", "temp_range": (3400, 3700), "mag_range": (8.0, 12.0), "dist_range": (5, 50), "color": "#FFAA80", "type": "Red Dwarf", "rarity": "common"},
        {"spectral": "F5V", "temp_range": (6300, 6600), "mag_range": (3.5, 5.5), "dist_range": (20, 200), "color": "#FFFFD0", "type": "Yellow-White Dwarf", "rarity": "uncommon"},
        {"spectral": "A0V", "temp_range": (9500, 10000), "mag_range": (1.0, 3.0), "dist_range": (50, 500), "color": "#D0E0FF", "type": "White Main Sequence", "rarity": "uncommon"},
        {"spectral": "K0III", "temp_range": (4800, 5100), "mag_range": (0.5, 2.5), "dist_range": (100, 800), "color": "#FFD080", "type": "Orange Giant", "rarity": "rare"},
        {"spectral": "M3III", "temp_range": (3200, 3500), "mag_range": (-0.5, 1.5), "dist_range": (200, 1000), "color": "#FF8060", "type": "Red Giant", "rarity": "rare"},
        {"spectral": "B8V", "temp_range": (11500, 12500), "mag_range": (0.0, 2.0), "dist_range": (100, 1000), "color": "#A0C0FF", "type": "Blue-White Star", "rarity": "rare"},
        {"spectral": "M2Ia", "temp_range": (3400, 3700), "mag_range": (-6.0, -4.0), "dist_range": (1000, 5000), "color": "#FF6040", "type": "Red Supergiant", "rarity": "legendary"},
        {"spectral": "B0Ia", "temp_range": (25000, 30000), "mag_range": (-7.0, -5.0), "dist_range": (2000, 10000), "color": "#8080FF", "type": "Blue Supergiant", "rarity": "legendary"},
        {"spectral": "WC8", "temp_range": (50000, 70000), "mag_range": (-4.0, -2.0), "dist_range": (3000, 15000), "color": "#A0A0FF", "type": "Wolf-Rayet Star", "rarity": "legendary"},
        {"spectral": "DA", "temp_range": (8000, 40000), "mag_range": (10.0, 15.0), "dist_range": (5, 100), "color": "#FFFFFF", "type": "White Dwarf", "rarity": "uncommon"},
    ]

    CONSTELLATION_REGIONS = [
        "Orion Arm", "Cygnus Rift", "Sagittarius Window", "Carina Nebula Region",
        "Perseus Arm", "Centaurus Field", "Scorpius Complex", "Vela Association",
        "Cepheus Flare", "Aquila Rift", "Ophiuchus Cloud", "Taurus Molecular Cloud"
    ]

    STAR_NAME_PREFIXES = ["Gaia DR3", "TYC", "HD", "HIP", "2MASS J", "UCAC4", "GSC"]

    def generate_gaia_star():
        """Generate a realistic random star based on Gaia catalog patterns"""
        import random
        weights = {"common": 60, "uncommon": 25, "rare": 12, "legendary": 3}
        rarity_pool = []
        for star_type in GAIA_STAR_POOL:
            rarity_pool.extend([star_type] * weights[star_type["rarity"]])
        star_template = random.choice(rarity_pool)
        prefix = random.choice(STAR_NAME_PREFIXES)
        if prefix == "Gaia DR3":
            star_id = f"{prefix} {random.randint(1000000000, 9999999999)}"
        elif prefix == "2MASS J":
            ra_str = f"{random.randint(0, 23):02d}{random.randint(0, 59):02d}{random.randint(0, 59):02d}.{random.randint(0, 99):02d}"
            dec_sign = random.choice(["+", "-"])
            dec_str = f"{random.randint(0, 89):02d}{random.randint(0, 59):02d}{random.randint(0, 59):02d}.{random.randint(0, 9)}"
            star_id = f"{prefix}{ra_str}{dec_sign}{dec_str}"
        else:
            star_id = f"{prefix} {random.randint(10000, 999999)}"
        temperature = random.randint(star_template["temp_range"][0], star_template["temp_range"][1])
        magnitude = round(random.uniform(star_template["mag_range"][0], star_template["mag_range"][1]), 2)
        distance = round(random.uniform(star_template["dist_range"][0], star_template["dist_range"][1]), 1)
        abs_magnitude = round(magnitude - 5 * math.log10(distance / 10), 2)
        luminosity = round(10 ** ((4.83 - abs_magnitude) / 2.5), 2)
        if "V" in star_template["spectral"]:
            mass = round((luminosity ** 0.25), 2)
        elif "III" in star_template["spectral"]:
            mass = round(1.5 + random.uniform(0, 2), 2)
        else:
            mass = round(10 + random.uniform(0, 30), 2)
        ra = round(random.uniform(0, 360), 4)
        dec = round(random.uniform(-90, 90), 4)
        proper_motion = round(random.uniform(0.1, 500), 2)
        parallax = round(1000 / distance, 3)
        radial_velocity = round(random.uniform(-150, 150), 1)
        return {
            "id": star_id,
            "spectral_type": star_template["spectral"],
            "temperature": temperature,
            "apparent_magnitude": magnitude,
            "absolute_magnitude": abs_magnitude,
            "distance_ly": distance,
            "distance_pc": round(distance / 3.262, 2),
            "luminosity_solar": luminosity,
            "mass_solar": mass,
            "color": star_template["color"],
            "star_type": star_template["type"],
            "rarity": star_template["rarity"],
            "ra": ra,
            "dec": dec,
            "proper_motion": proper_motion,
            "parallax": parallax,
            "radial_velocity": radial_velocity,
            "region": random.choice(CONSTELLATION_REGIONS),
            "discovery_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

    def get_rarity_color(rarity):
        colors = {"common": "#9ca3af", "uncommon": "#22c55e", "rare": "#3b82f6", "legendary": "#f59e0b"}
        return colors.get(rarity, "#9ca3af")

    def get_rarity_emoji(rarity):
        emojis = {"common": "", "uncommon": "", "rare": "", "legendary": ""}
        return emojis.get(rarity, "")

    # PRO Feature check
    if not check_pro_feature("Star Hunter", show_prompt=False):
        st.warning("Star Hunter is a PRO Feature")
        st.markdown("""
        <div class="cosmic-card">
            <h3 style="color: #fbbf24;">Unlock the Galaxy!</h3>
            <p class="insight-text">
            With Star Hunter PRO, you can:<br><br>
            - Discover and catalog real stars from the Gaia database<br>
            - Name your star discoveries<br>
            - Track your exploration statistics<br>
            - Build your personal star collection<br>
            - Find rare and legendary stellar objects
            </p>
        </div>
        """, unsafe_allow_html=True)
        st.markdown("---")
        st.markdown("### Demo Preview")
        demo_star = {"id": "Gaia DR3 Demo Star", "spectral_type": "G2V", "temperature": 5778, "apparent_magnitude": 4.83, "distance_ly": 32.6, "star_type": "Yellow Dwarf", "rarity": "common", "color": "#FFF5E0"}
        st.markdown(f"""
        <div class="cosmic-card" style="border-color: {get_rarity_color(demo_star['rarity'])};">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 60px; height: 60px; border-radius: 50%; background: radial-gradient(circle, {demo_star['color']}, transparent); box-shadow: 0 0 20px {demo_star['color']};"></div>
                <div>
                    <h3 style="margin: 0; color: #ffffff;">{demo_star['id']}</h3>
                    <p style="margin: 0; color: {get_rarity_color(demo_star['rarity'])}; text-transform: uppercase; font-size: 0.8rem;">{demo_star['rarity']} - {demo_star['star_type']}</p>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Upgrade to PRO", key="star_hunter_upgrade", use_container_width=True):
            check_pro_feature("Star Hunter", show_prompt=True)
    else:
        col_stats, col_actions = st.columns([1, 2])
        with col_stats:
            st.markdown("### Your Stats")
            discoveries_count = len(st.session_state["star_hunter_discoveries"])
            scans = st.session_state["star_hunter_total_scans"]
            rarity_counts = {"common": 0, "uncommon": 0, "rare": 0, "legendary": 0}
            for star in st.session_state["star_hunter_discoveries"]:
                rarity_counts[star.get("rarity", "common")] += 1
            st.metric("Total Discoveries", discoveries_count)
            st.metric("Total Scans", scans)
            if scans > 0:
                st.metric("Discovery Rate", f"{discoveries_count/scans*100:.1f}%")
            st.markdown("---")
            st.markdown("#### Collection")
            st.markdown(f"Common: {rarity_counts['common']}")
            st.markdown(f"Uncommon: {rarity_counts['uncommon']}")
            st.markdown(f"Rare: {rarity_counts['rare']}")
            st.markdown(f"Legendary: {rarity_counts['legendary']}")
        with col_actions:
            st.markdown("### Scan for Stars")
            st.markdown("Point your virtual telescope at the sky and discover new stars!")
            if st.button("Scan Deep Space", use_container_width=True, type="primary"):
                st.session_state["star_hunter_total_scans"] += 1
                new_star = generate_gaia_star()
                st.session_state["star_hunter_current_star"] = new_star
                st.rerun()
            if st.session_state["star_hunter_current_star"]:
                star = st.session_state["star_hunter_current_star"]
                rarity_color = get_rarity_color(star["rarity"])
                rarity_emoji = get_rarity_emoji(star["rarity"])
                st.markdown("---")
                st.markdown(f"### {rarity_emoji} New Star Detected!")
                st.markdown(f"""
                <div class="cosmic-card" style="border: 2px solid {rarity_color}; position: relative;">
                    <div style="position: absolute; top: 0.5rem; right: 0.5rem; background: {rarity_color}; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; text-transform: uppercase; font-weight: 600;">{star['rarity']}</div>
                    <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1rem;">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, {star['color']}, {star['color']}80 50%, transparent); box-shadow: 0 0 30px {star['color']}, 0 0 60px {star['color']}40; animation: pulse 2s ease-in-out infinite;"></div>
                        <div>
                            <h2 style="margin: 0; color: #ffffff; font-size: 1.3rem;">{star['id']}</h2>
                            <p style="margin: 0.25rem 0 0 0; color: {rarity_color}; font-weight: 500;">{star['star_type']}</p>
                            <p style="margin: 0; color: #9ca3af; font-size: 0.85rem;">Spectral Type: {star['spectral_type']}</p>
                        </div>
                    </div>
                </div>
                """, unsafe_allow_html=True)
                prop_col1, prop_col2, prop_col3 = st.columns(3)
                with prop_col1:
                    st.markdown("**Physical Properties**")
                    st.markdown(f"Temperature: **{star['temperature']:,} K**")
                    st.markdown(f"Luminosity: **{star['luminosity_solar']:.2f} L-sun**")
                    st.markdown(f"Mass: **{star['mass_solar']:.2f} M-sun**")
                with prop_col2:
                    st.markdown("**Distance & Brightness**")
                    st.markdown(f"Distance: **{star['distance_ly']:.1f} ly**")
                    st.markdown(f"App. Magnitude: **{star['apparent_magnitude']:.2f}**")
                    st.markdown(f"Abs. Magnitude: **{star['absolute_magnitude']:.2f}**")
                with prop_col3:
                    st.markdown("**Astrometry**")
                    st.markdown(f"RA: **{star['ra']:.4f} deg**")
                    st.markdown(f"Dec: **{star['dec']:.4f} deg**")
                    st.markdown(f"Radial Vel: **{star['radial_velocity']:.1f} km/s**")
                st.markdown(f"**Region:** {star['region']}")
                st.markdown("---")
                col_name, col_save = st.columns([3, 1])
                with col_name:
                    custom_name = st.text_input("Give your star a name (optional):", placeholder="e.g., 'My First Star' or leave blank for catalog ID", key="star_custom_name")
                with col_save:
                    st.markdown("<br>", unsafe_allow_html=True)
                    if st.button("Save to Collection", use_container_width=True):
                        existing_ids = [s["id"] for s in st.session_state["star_hunter_discoveries"]]
                        if star["id"] not in existing_ids:
                            star_to_save = star.copy()
                            if custom_name.strip():
                                star_to_save["custom_name"] = custom_name.strip()
                            st.session_state["star_hunter_discoveries"].append(star_to_save)
                            st.success("Star saved to your collection!")
                            st.session_state["star_hunter_current_star"] = None
                            st.rerun()
                        else:
                            st.warning("This star is already in your collection!")
        st.markdown("---")
        st.markdown("### My Discoveries")
        if st.session_state["star_hunter_discoveries"]:
            sort_col1, sort_col2 = st.columns([1, 3])
            with sort_col1:
                sort_by = st.selectbox("Sort by:", ["Discovery Time", "Rarity", "Distance", "Temperature"], key="star_sort")
            discoveries = st.session_state["star_hunter_discoveries"].copy()
            if sort_by == "Rarity":
                rarity_order = {"legendary": 0, "rare": 1, "uncommon": 2, "common": 3}
                discoveries.sort(key=lambda x: rarity_order.get(x.get("rarity", "common"), 3))
            elif sort_by == "Distance":
                discoveries.sort(key=lambda x: x.get("distance_ly", 0))
            elif sort_by == "Temperature":
                discoveries.sort(key=lambda x: x.get("temperature", 0), reverse=True)
            else:
                discoveries.reverse()
            for i in range(0, len(discoveries), 3):
                cols = st.columns(3)
                for j, col in enumerate(cols):
                    if i + j < len(discoveries):
                        star = discoveries[i + j]
                        rarity_color = get_rarity_color(star.get("rarity", "common"))
                        display_name = star.get("custom_name", star["id"])
                        with col:
                            st.markdown(f"""
                            <div style="background: linear-gradient(135deg, rgba(6, 147, 227, 0.08), rgba(99, 102, 241, 0.08)); border: 1px solid {rarity_color}; border-radius: 12px; padding: 1rem; margin-bottom: 0.5rem;">
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                    <div style="width: 30px; height: 30px; border-radius: 50%; background: radial-gradient(circle, {star.get('color', '#FFF')}, transparent); box-shadow: 0 0 10px {star.get('color', '#FFF')};"></div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #ffffff; font-size: 0.9rem;">{display_name[:25]}{'...' if len(display_name) > 25 else ''}</div>
                                        <div style="color: {rarity_color}; font-size: 0.7rem; text-transform: uppercase;">{star.get('rarity', 'common')}</div>
                                    </div>
                                </div>
                                <div style="font-size: 0.8rem; color: #9ca3af;">{star.get('star_type', 'Unknown')} | {star.get('distance_ly', 0):.1f} ly | {star.get('temperature', 0):,} K</div>
                            </div>
                            """, unsafe_allow_html=True)
            st.markdown("---")
            if st.button("Export Collection to CSV", use_container_width=False):
                export_data = []
                for star in st.session_state["star_hunter_discoveries"]:
                    export_data.append({
                        "Catalog ID": star["id"], "Custom Name": star.get("custom_name", ""),
                        "Star Type": star.get("star_type", ""), "Spectral Type": star.get("spectral_type", ""),
                        "Temperature (K)": star.get("temperature", ""), "Distance (ly)": star.get("distance_ly", ""),
                        "Apparent Magnitude": star.get("apparent_magnitude", ""), "Absolute Magnitude": star.get("absolute_magnitude", ""),
                        "Luminosity (Solar)": star.get("luminosity_solar", ""), "Mass (Solar)": star.get("mass_solar", ""),
                        "RA (deg)": star.get("ra", ""), "Dec (deg)": star.get("dec", ""),
                        "Rarity": star.get("rarity", ""), "Region": star.get("region", ""),
                        "Discovery Time": star.get("discovery_time", "")
                    })
                df = pd.DataFrame(export_data)
                csv = df.to_csv(index=False)
                st.download_button(label="Download CSV", data=csv, file_name=f"star_hunter_discoveries_{datetime.now().strftime('%Y%m%d')}.csv", mime="text/csv")
            with st.expander("Danger Zone"):
                if st.button("Clear All Discoveries", type="secondary"):
                    st.session_state["star_hunter_discoveries"] = []
                    st.session_state["star_hunter_current_star"] = None
                    st.session_state["star_hunter_total_scans"] = 0
                    st.rerun()
        else:
            st.info("No stars discovered yet. Start scanning to build your collection!")
        with st.expander("About Star Types & Spectral Classification"):
            st.markdown("""
            ### Understanding Stellar Classification

            Stars are classified by their spectral type, which tells us about their temperature and color:

            | Type | Color | Temperature | Examples |
            |------|-------|-------------|----------|
            | **O** | Blue | 30,000+ K | Rare, massive, short-lived |
            | **B** | Blue-White | 10,000-30,000 K | Rigel, Spica |
            | **A** | White | 7,500-10,000 K | Sirius, Vega |
            | **F** | Yellow-White | 6,000-7,500 K | Procyon |
            | **G** | Yellow | 5,200-6,000 K | **Our Sun** |
            | **K** | Orange | 3,700-5,200 K | Arcturus |
            | **M** | Red | 2,400-3,700 K | Betelgeuse, Proxima Centauri |

            **Luminosity Classes:**
            - **V** = Main Sequence (like our Sun)
            - **III** = Giant
            - **I** = Supergiant
            - **D** = White Dwarf

            **Rarity Guide:**
            - Common: Typical main sequence stars
            - Uncommon: Less common spectral types or white dwarfs
            - Rare: Giant stars and hot blue stars
            - Legendary: Supergiants and exotic objects
            """)


# ============== REAL DATA DISCOVERY PAGE ==============
elif page == "🔬 Real Data Discovery":
    st.header("🔬 Real Data Discovery Lab")
    st.markdown("**Analyze real astronomical data and make genuine discoveries!**")

    # Initialize session state for discoveries
    if "real_discoveries" not in st.session_state:
        st.session_state["real_discoveries"] = {
            "planet_candidates": [],
            "atmospheric_elements": [],
            "spectral_analyses": [],
            "certificates": [],
            "badges": [],
            "elements_found": set(),
            "total_analyses": 0
        }

    # Element database with spectral properties
    ELEMENT_DATABASE = {
        "H": {"name": "Hydrogen", "wavelengths": [656.3, 486.1, 434.0], "color": "#FF6B6B", "rarity": "common", "group": "nonmetal"},
        "He": {"name": "Helium", "wavelengths": [587.6, 501.6, 667.8], "color": "#FFEB3B", "rarity": "common", "group": "noble_gas"},
        "H2O": {"name": "Water Vapor", "wavelengths": [720.0, 820.0, 940.0], "color": "#2196F3", "rarity": "uncommon", "group": "molecule"},
        "CH4": {"name": "Methane", "wavelengths": [890.0, 1000.0, 1150.0], "color": "#4CAF50", "rarity": "uncommon", "group": "molecule"},
        "CO2": {"name": "Carbon Dioxide", "wavelengths": [1400.0, 1600.0, 2000.0], "color": "#9C27B0", "rarity": "uncommon", "group": "molecule"},
        "O2": {"name": "Oxygen", "wavelengths": [760.0, 690.0, 630.0], "color": "#00BCD4", "rarity": "rare", "group": "nonmetal"},
        "O3": {"name": "Ozone", "wavelengths": [600.0, 310.0, 255.0], "color": "#03A9F4", "rarity": "rare", "group": "molecule"},
        "N2": {"name": "Nitrogen", "wavelengths": [746.8, 744.2, 868.0], "color": "#607D8B", "rarity": "common", "group": "nonmetal"},
        "Na": {"name": "Sodium", "wavelengths": [589.0, 589.6, 330.2], "color": "#FF9800", "rarity": "uncommon", "group": "alkali"},
        "K": {"name": "Potassium", "wavelengths": [766.5, 769.9, 404.4], "color": "#E91E63", "rarity": "rare", "group": "alkali"},
        "Fe": {"name": "Iron", "wavelengths": [527.0, 516.7, 438.4], "color": "#795548", "rarity": "rare", "group": "transition"},
        "Ti": {"name": "Titanium", "wavelengths": [498.2, 453.3, 521.0], "color": "#9E9E9E", "rarity": "legendary", "group": "transition"},
        "V": {"name": "Vanadium", "wavelengths": [437.9, 438.5, 439.0], "color": "#CDDC39", "rarity": "legendary", "group": "transition"},
        "NH3": {"name": "Ammonia", "wavelengths": [1500.0, 2000.0, 2300.0], "color": "#8BC34A", "rarity": "uncommon", "group": "molecule"},
        "CO": {"name": "Carbon Monoxide", "wavelengths": [2350.0, 4600.0, 1560.0], "color": "#F44336", "rarity": "rare", "group": "molecule"},
        "SiO": {"name": "Silicon Monoxide", "wavelengths": [1100.0, 1200.0, 1300.0], "color": "#3F51B5", "rarity": "legendary", "group": "molecule"},
    }

    # Badge definitions
    BADGE_DEFINITIONS = {
        "first_discovery": {"name": "First Light", "icon": "🌟", "desc": "Made your first discovery", "requirement": 1},
        "element_hunter": {"name": "Element Hunter", "icon": "⚗️", "desc": "Found 5 different elements", "requirement": 5},
        "water_finder": {"name": "Water World Finder", "icon": "💧", "desc": "Detected water vapor", "requirement": "H2O"},
        "biosignature": {"name": "Biosignature Seeker", "icon": "🧬", "desc": "Found oxygen or ozone", "requirement": ["O2", "O3"]},
        "carbon_seeker": {"name": "Carbon Seeker", "icon": "🔥", "desc": "Found carbon compounds", "requirement": ["CH4", "CO2", "CO"]},
        "noble_finder": {"name": "Noble Gas Expert", "icon": "💨", "desc": "Detected helium", "requirement": "He"},
        "metal_detector": {"name": "Metal Detector", "icon": "⚙️", "desc": "Found metals in atmosphere", "requirement": ["Na", "K", "Fe", "Ti", "V"]},
        "planet_hunter": {"name": "Planet Hunter", "icon": "🪐", "desc": "Analyzed 10 planet candidates", "requirement": 10},
        "master_spectroscopist": {"name": "Master Spectroscopist", "icon": "🔬", "desc": "Completed 25 spectral analyses", "requirement": 25},
        "element_master": {"name": "Periodic Pioneer", "icon": "📊", "desc": "Found 10 different elements/molecules", "requirement": 10},
    }

    # Real exoplanet candidates from NASA archives (simulated based on real naming conventions)
    REAL_PLANET_CANDIDATES = [
        {"name": "TOI-700 d", "status": "Confirmed", "star": "TOI-700", "distance_ly": 101.4, "radius_earth": 1.07, "period_days": 37.4, "temp_k": 268, "discovery_method": "Transit", "year": 2020},
        {"name": "K2-18 b", "status": "Confirmed", "star": "K2-18", "distance_ly": 124, "radius_earth": 2.71, "period_days": 32.9, "temp_k": 284, "discovery_method": "Transit", "year": 2015},
        {"name": "LHS 1140 b", "status": "Confirmed", "star": "LHS 1140", "distance_ly": 40.7, "radius_earth": 1.73, "period_days": 24.7, "temp_k": 235, "discovery_method": "Transit", "year": 2017},
        {"name": "TRAPPIST-1 e", "status": "Confirmed", "star": "TRAPPIST-1", "distance_ly": 39.5, "radius_earth": 0.92, "period_days": 6.1, "temp_k": 251, "discovery_method": "Transit", "year": 2017},
        {"name": "Kepler-442 b", "status": "Confirmed", "star": "Kepler-442", "distance_ly": 112, "radius_earth": 1.34, "period_days": 112.3, "temp_k": 233, "discovery_method": "Transit", "year": 2015},
        {"name": "Proxima Centauri b", "status": "Confirmed", "star": "Proxima Centauri", "distance_ly": 4.24, "radius_earth": 1.08, "period_days": 11.2, "temp_k": 234, "discovery_method": "Radial Velocity", "year": 2016},
        {"name": "TOI-4481.01", "status": "Candidate", "star": "TOI-4481", "distance_ly": 215, "radius_earth": 1.89, "period_days": 28.6, "temp_k": 295, "discovery_method": "Transit", "year": 2023},
        {"name": "TOI-5293.01", "status": "Candidate", "star": "TOI-5293", "distance_ly": 178, "radius_earth": 1.45, "period_days": 42.1, "temp_k": 272, "discovery_method": "Transit", "year": 2023},
        {"name": "KOI-7923.01", "status": "Candidate", "star": "KOI-7923", "distance_ly": 890, "radius_earth": 1.12, "period_days": 395, "temp_k": 248, "discovery_method": "Transit", "year": 2022},
        {"name": "TOI-6321.01", "status": "Candidate", "star": "TOI-6321", "distance_ly": 145, "radius_earth": 2.1, "period_days": 18.9, "temp_k": 310, "discovery_method": "Transit", "year": 2024},
    ]

    def check_and_award_badges():
        """Check and award badges based on discoveries."""
        discoveries = st.session_state["real_discoveries"]
        current_badges = set(discoveries["badges"])
        new_badges = []

        # First discovery badge
        if "first_discovery" not in current_badges and discoveries["total_analyses"] >= 1:
            new_badges.append("first_discovery")

        # Element count badges
        element_count = len(discoveries["elements_found"])
        if "element_hunter" not in current_badges and element_count >= 5:
            new_badges.append("element_hunter")
        if "element_master" not in current_badges and element_count >= 10:
            new_badges.append("element_master")

        # Specific element badges
        if "water_finder" not in current_badges and "H2O" in discoveries["elements_found"]:
            new_badges.append("water_finder")

        if "biosignature" not in current_badges:
            if "O2" in discoveries["elements_found"] or "O3" in discoveries["elements_found"]:
                new_badges.append("biosignature")

        if "carbon_seeker" not in current_badges:
            carbon_compounds = {"CH4", "CO2", "CO"}
            if discoveries["elements_found"] & carbon_compounds:
                new_badges.append("carbon_seeker")

        if "noble_finder" not in current_badges and "He" in discoveries["elements_found"]:
            new_badges.append("noble_finder")

        if "metal_detector" not in current_badges:
            metals = {"Na", "K", "Fe", "Ti", "V"}
            if discoveries["elements_found"] & metals:
                new_badges.append("metal_detector")

        # Analysis count badges
        if "planet_hunter" not in current_badges and len(discoveries["planet_candidates"]) >= 10:
            new_badges.append("planet_hunter")

        if "master_spectroscopist" not in current_badges and len(discoveries["spectral_analyses"]) >= 25:
            new_badges.append("master_spectroscopist")

        # Add new badges
        for badge in new_badges:
            discoveries["badges"].append(badge)

        return new_badges

    def generate_atmosphere_for_planet(planet):
        """Generate realistic atmospheric composition based on planet properties."""
        import random
        random.seed(hash(planet["name"]))

        atmosphere = {}
        temp = planet["temp_k"]
        radius = planet["radius_earth"]

        # Base composition depends on planet type
        if radius > 2.5:
            # Gas giant-like
            atmosphere["H"] = random.uniform(0.75, 0.90)
            atmosphere["He"] = random.uniform(0.08, 0.20)
            if temp < 400:
                atmosphere["CH4"] = random.uniform(0.001, 0.02)
                atmosphere["NH3"] = random.uniform(0.001, 0.01)
        elif radius > 1.6:
            # Sub-Neptune
            atmosphere["H"] = random.uniform(0.40, 0.70)
            atmosphere["He"] = random.uniform(0.10, 0.25)
            atmosphere["H2O"] = random.uniform(0.01, 0.10)
            if temp < 500:
                atmosphere["CH4"] = random.uniform(0.001, 0.05)
        else:
            # Rocky/terrestrial
            atmosphere["N2"] = random.uniform(0.50, 0.85)
            atmosphere["CO2"] = random.uniform(0.001, 0.30)
            if 200 < temp < 350:
                atmosphere["H2O"] = random.uniform(0.001, 0.05)
                if random.random() < 0.3:
                    atmosphere["O2"] = random.uniform(0.01, 0.25)
                    if random.random() < 0.5:
                        atmosphere["O3"] = random.uniform(0.00001, 0.0001)

        # Hot planets might have exotic elements
        if temp > 1000:
            if random.random() < 0.4:
                atmosphere["Na"] = random.uniform(0.0001, 0.001)
            if random.random() < 0.3:
                atmosphere["K"] = random.uniform(0.0001, 0.0005)
            if random.random() < 0.2:
                atmosphere["Fe"] = random.uniform(0.00001, 0.0001)
            if random.random() < 0.1:
                atmosphere["Ti"] = random.uniform(0.000001, 0.00001)

        return atmosphere

    def generate_spectral_data(atmosphere, noise_level=0.1):
        """Generate synthetic spectral absorption data based on atmosphere."""
        import random
        wavelengths = np.linspace(300, 2500, 500)
        spectrum = np.ones(len(wavelengths))

        # Add absorption features for each element
        for element, fraction in atmosphere.items():
            if element in ELEMENT_DATABASE:
                elem_data = ELEMENT_DATABASE[element]
                for line_wl in elem_data["wavelengths"]:
                    # Gaussian absorption profile
                    width = 5 + random.uniform(-2, 5)
                    depth = min(0.9, fraction * 10 + random.uniform(0, 0.3))
                    spectrum *= 1 - depth * np.exp(-((wavelengths - line_wl) ** 2) / (2 * width ** 2))

        # Add noise
        spectrum += np.random.normal(0, noise_level, len(wavelengths))
        spectrum = np.clip(spectrum, 0, 1)

        return wavelengths, spectrum

    def generate_certificate(planet_name, discoverer_name, elements_found, analysis_date):
        """Generate HTML certificate for discovery."""
        elements_list = ", ".join([ELEMENT_DATABASE.get(e, {"name": e})["name"] for e in elements_found])
        cert_id = f"ASTRO-{hash(planet_name + discoverer_name) % 100000:05d}"

        certificate_html = f"""
        <div style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 3px solid #d4a853;
            border-radius: 16px;
            padding: 2rem;
            text-align: center;
            margin: 1rem 0;
            box-shadow: 0 0 30px rgba(212, 168, 83, 0.3);
        ">
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
            <h1 style="color: #d4a853; margin: 0; font-family: serif; font-size: 1.8rem;">
                CERTIFICATE OF DISCOVERY
            </h1>
            <hr style="border: 1px solid #d4a853; margin: 1rem 3rem;">
            <p style="color: #e5e7eb; font-size: 1rem; margin: 0.5rem 0;">
                This certifies that
            </p>
            <h2 style="color: #ffffff; margin: 0.5rem 0; font-size: 1.5rem;">
                {discoverer_name}
            </h2>
            <p style="color: #e5e7eb; font-size: 1rem; margin: 0.5rem 0;">
                has successfully analyzed the atmospheric composition of
            </p>
            <h2 style="color: #0693e3; margin: 0.5rem 0; font-size: 1.4rem;">
                {planet_name}
            </h2>
            <p style="color: #e5e7eb; font-size: 0.9rem; margin: 1rem 0;">
                <b>Elements/Molecules Detected:</b><br>
                {elements_list}
            </p>
            <hr style="border: 1px solid #d4a853; margin: 1rem 3rem;">
            <p style="color: #9ca3af; font-size: 0.8rem; margin: 0.5rem 0;">
                Certificate ID: {cert_id}<br>
                Date: {analysis_date.strftime('%B %d, %Y')}<br>
                AstroData Real Data Discovery Lab
            </p>
            <div style="margin-top: 1rem;">
                <span style="font-size: 1.5rem;">🔬</span>
                <span style="font-size: 1.5rem; margin: 0 0.5rem;">🪐</span>
                <span style="font-size: 1.5rem;">⚗️</span>
            </div>
        </div>
        """
        return certificate_html, cert_id

    # PRO feature check
    if not check_pro_feature("Real Data Discovery"):
        st.warning("🔬 **Real Data Discovery** is a PRO feature!")
        st.info("""
        With PRO access, you can:
        - Analyze real exoplanet candidates from NASA/TESS
        - Perform spectroscopic analysis to detect atmospheric elements
        - Build your element collection with periodic table tracking
        - Earn badges and discovery certificates
        - Submit discoveries to your personal registry
        """)
    else:
        # Stats row
        discoveries = st.session_state["real_discoveries"]
        col_s1, col_s2, col_s3, col_s4 = st.columns(4)
        with col_s1:
            st.metric("Total Analyses", discoveries["total_analyses"])
        with col_s2:
            st.metric("Elements Found", len(discoveries["elements_found"]))
        with col_s3:
            st.metric("Badges Earned", len(discoveries["badges"]))
        with col_s4:
            st.metric("Certificates", len(discoveries["certificates"]))

        # Tabs for different workflows
        workflow_tab = st.tabs(["🔬 Spectroscopy Lab", "📊 Element Collection", "🏆 Badges & Achievements", "📜 Discovery Registry"])

        # ============ TAB 1: SPECTROSCOPY LAB ============
        with workflow_tab[0]:
            st.subheader("Atmospheric Spectroscopy Analysis")

            st.markdown("""
            <div class="cosmic-card">
                <p style="margin: 0; color: #9ca3af;">
                    <b>How it works:</b> Select a planet candidate, analyze its transmission spectrum,
                    and identify the elements present in its atmosphere. Real scientists use this exact
                    technique with JWST to characterize exoplanet atmospheres!
                </p>
            </div>
            """, unsafe_allow_html=True)

            # Step 1: Select target
            st.markdown("### Step 1: Select Target Planet")
            col_select, col_info = st.columns([1, 1])

            with col_select:
                planet_options = [f"{p['name']} ({p['status']})" for p in REAL_PLANET_CANDIDATES]
                selected_idx = st.selectbox("Choose a planet to analyze:", range(len(planet_options)),
                                           format_func=lambda x: planet_options[x], key="spectro_planet")
                selected_planet = REAL_PLANET_CANDIDATES[selected_idx]

            with col_info:
                st.markdown(f"""
                <div class="cosmic-card">
                    <h4 style="color: #0693e3; margin: 0;">{selected_planet['name']}</h4>
                    <p style="margin: 0.5rem 0; color: #e5e7eb;">
                        Star: {selected_planet['star']}<br>
                        Distance: {selected_planet['distance_ly']:.1f} light-years<br>
                        Radius: {selected_planet['radius_earth']:.2f} Earth radii<br>
                        Temperature: {selected_planet['temp_k']} K ({selected_planet['temp_k'] - 273:.0f}°C)
                    </p>
                </div>
                """, unsafe_allow_html=True)

            # Step 2: Generate and display spectrum
            st.markdown("### Step 2: Analyze Transmission Spectrum")

            if st.button("🔬 Acquire Spectrum", type="primary", use_container_width=True):
                st.session_state["current_spectrum"] = {
                    "planet": selected_planet,
                    "atmosphere": generate_atmosphere_for_planet(selected_planet),
                    "analyzed": False
                }

            if "current_spectrum" in st.session_state and st.session_state["current_spectrum"]:
                current = st.session_state["current_spectrum"]
                wavelengths, spectrum = generate_spectral_data(current["atmosphere"])

                # Plot spectrum
                fig, ax = plt.subplots(figsize=(12, 5))
                fig.patch.set_facecolor('#1a1a2e')
                ax.set_facecolor('#1a1a2e')
                ax.plot(wavelengths, spectrum, color='#0693e3', linewidth=1)
                ax.fill_between(wavelengths, spectrum, alpha=0.3, color='#0693e3')
                ax.set_xlabel('Wavelength (nm)', color='#e5e7eb')
                ax.set_ylabel('Normalized Flux', color='#e5e7eb')
                ax.set_title(f'Transmission Spectrum of {current["planet"]["name"]}', color='#ffffff')
                ax.tick_params(colors='#9ca3af')
                ax.spines['bottom'].set_color('#4b5563')
                ax.spines['top'].set_color('#4b5563')
                ax.spines['left'].set_color('#4b5563')
                ax.spines['right'].set_color('#4b5563')
                ax.set_ylim(0, 1.2)
                ax.grid(alpha=0.2, color='#4b5563')
                st.pyplot(fig)
                plt.close()

                # Step 3: Identify elements (mini-game)
                st.markdown("### Step 3: Identify Absorption Features")
                st.info("🎯 Click on elements you think are present in the spectrum based on the absorption dips!")

                # Element selection grid
                element_cols = st.columns(4)
                user_selections = set()

                all_elements = list(ELEMENT_DATABASE.keys())
                for i, elem in enumerate(all_elements):
                    with element_cols[i % 4]:
                        elem_data = ELEMENT_DATABASE[elem]
                        if st.checkbox(f"{elem} ({elem_data['name']})", key=f"elem_{elem}"):
                            user_selections.add(elem)

                # Step 4: Submit analysis
                st.markdown("### Step 4: Submit Your Analysis")

                user_name = st.session_state.get("user_display_name", "Cosmic Explorer")

                if st.button("📤 Submit Analysis & Claim Discovery", type="primary", use_container_width=True):
                    actual_elements = set(current["atmosphere"].keys())

                    # Score the analysis
                    correct = user_selections & actual_elements
                    incorrect = user_selections - actual_elements
                    missed = actual_elements - user_selections

                    accuracy = len(correct) / max(1, len(actual_elements)) * 100

                    st.markdown("---")
                    st.markdown("### 📊 Analysis Results")

                    res_col1, res_col2, res_col3 = st.columns(3)
                    with res_col1:
                        st.metric("Accuracy", f"{accuracy:.0f}%")
                    with res_col2:
                        st.metric("Correct IDs", len(correct))
                    with res_col3:
                        st.metric("Elements Missed", len(missed))

                    # Show what was found
                    st.markdown("#### ✅ Correctly Identified:")
                    if correct:
                        for elem in correct:
                            elem_data = ELEMENT_DATABASE[elem]
                            rarity_colors = {"common": "#22C55E", "uncommon": "#3B82F6", "rare": "#A855F7", "legendary": "#F59E0B"}
                            st.markdown(f"""
                            <span style="background: {rarity_colors.get(elem_data['rarity'], '#666')}22;
                                        color: {rarity_colors.get(elem_data['rarity'], '#fff')};
                                        padding: 0.25rem 0.75rem; border-radius: 4px; margin-right: 0.5rem;">
                                {elem} - {elem_data['name']} ({elem_data['rarity'].upper()})
                            </span>
                            """, unsafe_allow_html=True)
                    else:
                        st.write("None")

                    if missed:
                        st.markdown("#### ❌ Missed Elements:")
                        for elem in missed:
                            if elem in ELEMENT_DATABASE:
                                st.write(f"- {elem} ({ELEMENT_DATABASE[elem]['name']})")

                    # Update discoveries
                    discoveries["total_analyses"] += 1
                    discoveries["elements_found"].update(correct)
                    discoveries["spectral_analyses"].append({
                        "planet": current["planet"]["name"],
                        "date": datetime.now(),
                        "accuracy": accuracy,
                        "elements": list(correct)
                    })

                    if accuracy >= 50:
                        discoveries["planet_candidates"].append({
                            "planet": current["planet"]["name"],
                            "elements": list(correct),
                            "date": datetime.now(),
                            "accuracy": accuracy
                        })

                        # Generate certificate
                        if len(correct) > 0:
                            cert_html, cert_id = generate_certificate(
                                current["planet"]["name"],
                                user_name,
                                correct,
                                datetime.now()
                            )
                            discoveries["certificates"].append({
                                "id": cert_id,
                                "planet": current["planet"]["name"],
                                "elements": list(correct),
                                "date": datetime.now()
                            })

                            st.markdown("---")
                            st.markdown("### 🏆 Discovery Certificate")
                            st.markdown(cert_html, unsafe_allow_html=True)

                            # Download button for certificate
                            st.download_button(
                                label="📥 Download Certificate",
                                data=cert_html,
                                file_name=f"discovery_certificate_{cert_id}.html",
                                mime="text/html"
                            )

                    # Check for new badges
                    new_badges = check_and_award_badges()
                    if new_badges:
                        st.markdown("---")
                        st.markdown("### 🎉 New Badges Earned!")
                        for badge_id in new_badges:
                            badge = BADGE_DEFINITIONS[badge_id]
                            st.success(f"{badge['icon']} **{badge['name']}** - {badge['desc']}")

                    # Educational content
                    st.markdown("---")
                    st.markdown("### 📚 How Scientists Detect These Elements")

                    with st.expander("Learn About Spectroscopy", expanded=False):
                        st.markdown("""
                        **Transmission Spectroscopy** is the primary technique used to study exoplanet atmospheres:

                        1. **Transit Observation**: When a planet passes in front of its star, some starlight
                           filters through the planet's atmosphere.

                        2. **Absorption Features**: Different molecules absorb light at specific wavelengths,
                           creating "fingerprints" in the spectrum.

                        3. **JWST Discoveries**: The James Webb Space Telescope has detected:
                           - **Water vapor** on WASP-96 b
                           - **Carbon dioxide** on WASP-39 b
                           - **Methane and carbon dioxide** on K2-18 b

                        4. **Biosignatures**: Oxygen and ozone together could indicate biological activity!

                        The spectrum you analyzed simulates real absorption features based on known
                        spectral line positions for each element and molecule.
                        """)

                    # Clear current spectrum
                    st.session_state["current_spectrum"] = None

        # ============ TAB 2: ELEMENT COLLECTION ============
        with workflow_tab[1]:
            st.subheader("📊 Your Element Collection")

            elements_found = discoveries["elements_found"]

            if not elements_found:
                st.info("You haven't discovered any elements yet! Start analyzing planets in the Spectroscopy Lab.")
            else:
                st.markdown(f"**{len(elements_found)}** elements/molecules discovered!")

                # Group by type
                groups = {
                    "Noble Gases": ["He"],
                    "Nonmetals": ["H", "O2", "N2"],
                    "Molecules": ["H2O", "CH4", "CO2", "O3", "NH3", "CO", "SiO"],
                    "Alkali Metals": ["Na", "K"],
                    "Transition Metals": ["Fe", "Ti", "V"]
                }

                for group_name, group_elements in groups.items():
                    found_in_group = [e for e in group_elements if e in elements_found]
                    total_in_group = len(group_elements)

                    st.markdown(f"### {group_name} ({len(found_in_group)}/{total_in_group})")

                    elem_cols = st.columns(min(4, len(group_elements)))
                    for i, elem in enumerate(group_elements):
                        with elem_cols[i % len(elem_cols)]:
                            is_found = elem in elements_found
                            elem_data = ELEMENT_DATABASE.get(elem, {"name": elem, "color": "#666", "rarity": "unknown"})
                            rarity_colors = {"common": "#22C55E", "uncommon": "#3B82F6", "rare": "#A855F7", "legendary": "#F59E0B"}

                            if is_found:
                                st.markdown(f"""
                                <div style="background: {elem_data['color']}22; border: 2px solid {elem_data['color']};
                                            border-radius: 8px; padding: 1rem; text-align: center; margin: 0.25rem 0;">
                                    <div style="font-size: 1.5rem; font-weight: bold; color: {elem_data['color']};">{elem}</div>
                                    <div style="font-size: 0.8rem; color: #e5e7eb;">{elem_data['name']}</div>
                                    <div style="font-size: 0.7rem; color: {rarity_colors.get(elem_data['rarity'], '#666')};">
                                        {elem_data['rarity'].upper()}
                                    </div>
                                </div>
                                """, unsafe_allow_html=True)
                            else:
                                st.markdown(f"""
                                <div style="background: #1a1a2e; border: 2px dashed #4b5563;
                                            border-radius: 8px; padding: 1rem; text-align: center; margin: 0.25rem 0;">
                                    <div style="font-size: 1.5rem; font-weight: bold; color: #4b5563;">?</div>
                                    <div style="font-size: 0.8rem; color: #4b5563;">Undiscovered</div>
                                </div>
                                """, unsafe_allow_html=True)

                # Progress bar
                st.markdown("---")
                total_elements = len(ELEMENT_DATABASE)
                progress = len(elements_found) / total_elements
                st.progress(progress)
                st.caption(f"Collection Progress: {len(elements_found)}/{total_elements} ({progress*100:.0f}%)")

        # ============ TAB 3: BADGES ============
        with workflow_tab[2]:
            st.subheader("🏆 Badges & Achievements")

            earned_badges = discoveries["badges"]

            if not earned_badges:
                st.info("Complete spectral analyses to earn badges!")

            # Display all badges
            badge_cols = st.columns(3)
            for i, (badge_id, badge) in enumerate(BADGE_DEFINITIONS.items()):
                with badge_cols[i % 3]:
                    is_earned = badge_id in earned_badges

                    if is_earned:
                        st.markdown(f"""
                        <div class="cosmic-card" style="text-align: center; border: 2px solid #d4a853;">
                            <div style="font-size: 2.5rem;">{badge['icon']}</div>
                            <h4 style="color: #d4a853; margin: 0.5rem 0;">{badge['name']}</h4>
                            <p style="color: #9ca3af; font-size: 0.8rem; margin: 0;">{badge['desc']}</p>
                            <span style="background: #22C55E33; color: #22C55E; padding: 0.25rem 0.5rem;
                                        border-radius: 4px; font-size: 0.7rem;">EARNED</span>
                        </div>
                        """, unsafe_allow_html=True)
                    else:
                        st.markdown(f"""
                        <div class="cosmic-card" style="text-align: center; opacity: 0.5;">
                            <div style="font-size: 2.5rem; filter: grayscale(1);">{badge['icon']}</div>
                            <h4 style="color: #4b5563; margin: 0.5rem 0;">{badge['name']}</h4>
                            <p style="color: #4b5563; font-size: 0.8rem; margin: 0;">{badge['desc']}</p>
                            <span style="background: #4b556333; color: #4b5563; padding: 0.25rem 0.5rem;
                                        border-radius: 4px; font-size: 0.7rem;">LOCKED</span>
                        </div>
                        """, unsafe_allow_html=True)

            st.markdown("---")
            st.metric("Badges Earned", f"{len(earned_badges)}/{len(BADGE_DEFINITIONS)}")

        # ============ TAB 4: DISCOVERY REGISTRY ============
        with workflow_tab[3]:
            st.subheader("📜 Your Discovery Registry")

            certificates = discoveries["certificates"]

            if not certificates:
                st.info("Complete spectral analyses to earn discovery certificates!")
            else:
                st.markdown(f"**{len(certificates)}** discoveries registered!")

                for cert in reversed(certificates):  # Show newest first
                    with st.expander(f"🏆 {cert['planet']} - {cert['date'].strftime('%Y-%m-%d')}", expanded=False):
                        st.markdown(f"""
                        <div class="cosmic-card">
                            <p><b>Certificate ID:</b> {cert['id']}</p>
                            <p><b>Planet:</b> {cert['planet']}</p>
                            <p><b>Elements Detected:</b> {', '.join(cert['elements'])}</p>
                            <p><b>Date:</b> {cert['date'].strftime('%B %d, %Y at %H:%M')}</p>
                        </div>
                        """, unsafe_allow_html=True)

                # Export registry
                st.markdown("---")
                if st.button("📥 Export Full Discovery Log"):
                    export_data = []
                    for cert in certificates:
                        export_data.append({
                            "Certificate ID": cert["id"],
                            "Planet": cert["planet"],
                            "Elements": ", ".join(cert["elements"]),
                            "Date": cert["date"].strftime("%Y-%m-%d %H:%M")
                        })
                    df = pd.DataFrame(export_data)
                    csv = df.to_csv(index=False)
                    st.download_button(
                        label="Download CSV",
                        data=csv,
                        file_name="my_discovery_registry.csv",
                        mime="text/csv"
                    )


# ============== ASTEROID HUNTER PAGE (PRO FEATURE) ==============
elif page == "☄️ Asteroid Hunter":
    st.header("☄️ Asteroid Hunter")
    st.markdown("**Track Near-Earth Objects and become a cosmic defender!**")

    # Check for PRO access
    has_pro_access = check_pro_feature("Asteroid Hunter", show_prompt=False)

    if not has_pro_access:
        st.warning("⭐ **PRO Feature** - Upgrade to unlock full Asteroid Hunter capabilities including real-time tracking, custom alerts, and detailed threat analysis!")
        st.info("Preview mode: You can explore basic asteroid data below.")

    # Initialize session state for tracked asteroids
    if "tracked_asteroids" not in st.session_state:
        st.session_state["tracked_asteroids"] = []
    if "asteroid_alerts" not in st.session_state:
        st.session_state["asteroid_alerts"] = []

    # Simulated NASA NEO data (based on real asteroid characteristics)
    def generate_neo_data():
        """Generate realistic Near-Earth Object data based on NASA NEO concepts"""
        np.random.seed(int(datetime.now().strftime("%Y%m%d")))  # Daily seed for consistency

        neo_names = [
            "2024 AA1", "2024 BX7", "2024 CK3", "2024 DM9", "2024 EQ2",
            "2024 FH15", "2024 GT8", "2024 HN12", "2024 JR4", "2024 KL6",
            "Apophis", "Bennu", "Ryugu", "Eros", "Itokawa",
            "2023 DW", "2024 MK", "2024 PT5", "2024 ON", "2024 RW1"
        ]

        asteroids = []
        today = datetime.now()

        for i, name in enumerate(neo_names):
            # Generate realistic properties
            is_famous = name in ["Apophis", "Bennu", "Ryugu", "Eros", "Itokawa"]

            if is_famous:
                # Famous asteroids with known properties
                if name == "Apophis":
                    size = 370
                    velocity = 30.73
                    close_approach = today + timedelta(days=365 * 5 + np.random.randint(-30, 30))
                    min_distance = 31000  # km from Earth surface on close approach
                elif name == "Bennu":
                    size = 492
                    velocity = 28.0
                    close_approach = today + timedelta(days=np.random.randint(100, 500))
                    min_distance = 750000
                elif name == "Ryugu":
                    size = 900
                    velocity = 32.0
                    close_approach = today + timedelta(days=np.random.randint(200, 600))
                    min_distance = 1200000
                elif name == "Eros":
                    size = 16840  # 16.84 km
                    velocity = 24.36
                    close_approach = today + timedelta(days=np.random.randint(300, 800))
                    min_distance = 22000000
                else:  # Itokawa
                    size = 330
                    velocity = 25.37
                    close_approach = today + timedelta(days=np.random.randint(150, 450))
                    min_distance = 3500000
            else:
                # Generate random NEO properties
                size = int(np.random.lognormal(3, 1.5))  # meters, log-normal distribution
                size = max(5, min(size, 5000))  # Clamp between 5m and 5km
                velocity = np.random.uniform(5, 70)  # km/s
                close_approach = today + timedelta(days=np.random.randint(1, 365))
                # Distance in km, closer objects are rarer
                min_distance = int(np.random.lognormal(13, 2))
                min_distance = max(50000, min(min_distance, 50000000))

            # Calculate threat level based on size and distance
            # Torino Scale inspired calculation
            size_factor = min(size / 100, 10)  # Normalize size
            distance_factor = max(0, 1 - (min_distance / 1000000))  # Closer = higher factor
            threat_score = size_factor * distance_factor * 10

            if threat_score >= 8:
                threat_level = "CRITICAL"
                threat_color = "#ef4444"
            elif threat_score >= 5:
                threat_level = "HIGH"
                threat_color = "#f97316"
            elif threat_score >= 2:
                threat_level = "MODERATE"
                threat_color = "#eab308"
            elif threat_score >= 0.5:
                threat_level = "LOW"
                threat_color = "#22c55e"
            else:
                threat_level = "MINIMAL"
                threat_color = "#6b7280"

            asteroids.append({
                "name": name,
                "size_m": size,
                "velocity_kms": round(velocity, 2),
                "close_approach": close_approach,
                "min_distance_km": min_distance,
                "threat_level": threat_level,
                "threat_color": threat_color,
                "threat_score": round(threat_score, 2),
                "is_famous": is_famous
            })

        # Sort by close approach date
        asteroids.sort(key=lambda x: x["close_approach"])
        return asteroids

    # Famous asteroid fun facts
    ASTEROID_FUN_FACTS = {
        "Apophis": {
            "discovery": "June 19, 2004",
            "named_after": "Egyptian god of chaos and destruction",
            "fun_fact": "On April 13, 2029, Apophis will pass closer than our geostationary satellites! It will be visible to the naked eye from Earth.",
            "mission": "OSIRIS-APEX (formerly OSIRIS-REx) will rendezvous with Apophis after its 2029 flyby",
            "composition": "Sq-class (stony) asteroid"
        },
        "Bennu": {
            "discovery": "September 11, 1999",
            "named_after": "Ancient Egyptian deity associated with the Sun and creation",
            "fun_fact": "NASA's OSIRIS-REx collected samples from Bennu and returned them to Earth in September 2023!",
            "mission": "OSIRIS-REx (sample returned 2023)",
            "composition": "B-type carbonaceous asteroid, possibly containing amino acids"
        },
        "Ryugu": {
            "discovery": "May 10, 1999",
            "named_after": "Dragon Palace from Japanese folklore",
            "fun_fact": "JAXA's Hayabusa2 found that Ryugu contains water and organic matter - building blocks of life!",
            "mission": "Hayabusa2 (sample returned 2020)",
            "composition": "C-type carbonaceous asteroid"
        },
        "Eros": {
            "discovery": "August 13, 1898",
            "named_after": "Greek god of love",
            "fun_fact": "Eros was the first asteroid ever orbited by a spacecraft (NEAR Shoemaker in 2000)!",
            "mission": "NEAR Shoemaker (first asteroid orbiter, landed 2001)",
            "composition": "S-type silicate asteroid"
        },
        "Itokawa": {
            "discovery": "September 26, 1998",
            "named_after": "Hideo Itokawa, father of Japanese rocketry",
            "fun_fact": "Itokawa is shaped like a peanut and is actually two asteroids that gently collided and stuck together!",
            "mission": "Hayabusa (first asteroid sample return, 2010)",
            "composition": "S-type stony asteroid, rubble pile structure"
        }
    }

    # Generate asteroid data
    asteroids = generate_neo_data()

    # Display modes
    view_mode = st.radio(
        "View Mode:",
        ["🎯 Threat Dashboard", "📅 Upcoming Approaches", "⭐ Famous Asteroids", "🔔 My Tracked Objects"],
        horizontal=True
    )

    st.markdown("---")

    if view_mode == "🎯 Threat Dashboard":
        st.subheader("🎯 Near-Earth Object Threat Dashboard")

        # Summary stats
        col1, col2, col3, col4 = st.columns(4)

        critical_count = len([a for a in asteroids if a["threat_level"] == "CRITICAL"])
        high_count = len([a for a in asteroids if a["threat_level"] == "HIGH"])
        this_week = len([a for a in asteroids if (a["close_approach"] - datetime.now()).days <= 7])
        tracked_count = len(st.session_state["tracked_asteroids"])

        with col1:
            st.metric("Total NEOs", len(asteroids), delta=None)
        with col2:
            st.metric("Critical/High Threat", f"{critical_count + high_count}", delta=None)
        with col3:
            st.metric("This Week", this_week, delta=None)
        with col4:
            st.metric("You're Tracking", tracked_count, delta=None)

        # Current threat level indicator
        if critical_count > 0:
            st.error("🚨 **THREAT LEVEL: ELEVATED** - Critical threat objects detected!")
        elif high_count > 0:
            st.warning("⚠️ **THREAT LEVEL: MODERATE** - High threat objects being monitored")
        else:
            st.success("✅ **THREAT LEVEL: NOMINAL** - No significant threats detected")

        st.markdown("### Top Threats")

        # Show top 10 by threat score
        top_threats = sorted(asteroids, key=lambda x: x["threat_score"], reverse=True)[:10]

        for asteroid in top_threats:
            days_until = (asteroid["close_approach"] - datetime.now()).days

            # Size category
            if asteroid["size_m"] >= 1000:
                size_display = f"{asteroid['size_m']/1000:.1f} km"
                size_emoji = "🌑"
            elif asteroid["size_m"] >= 100:
                size_display = f"{asteroid['size_m']} m"
                size_emoji = "🪨"
            else:
                size_display = f"{asteroid['size_m']} m"
                size_emoji = "💎"

            # Distance display
            if asteroid["min_distance_km"] >= 1000000:
                dist_display = f"{asteroid['min_distance_km']/1000000:.2f}M km"
            else:
                dist_display = f"{asteroid['min_distance_km']:,} km"

            is_tracked = asteroid["name"] in st.session_state["tracked_asteroids"]

            st.markdown(f"""
            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba({asteroid['threat_color'][1:]}, 0.15));
                        border: 1px solid {asteroid['threat_color']}; border-radius: 12px; padding: 1rem; margin: 0.5rem 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                    <div>
                        <span style="font-size: 1.2rem; font-weight: bold;">{size_emoji} {asteroid['name']}</span>
                        <span style="background: {asteroid['threat_color']}; color: white; padding: 2px 8px; border-radius: 4px; margin-left: 8px; font-size: 0.75rem;">{asteroid['threat_level']}</span>
                        {"<span style='color: #fbbf24; margin-left: 8px;'>🔔 TRACKED</span>" if is_tracked else ""}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.1rem; font-weight: bold; color: {asteroid['threat_color']};">Threat: {asteroid['threat_score']}</div>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.5rem; margin-top: 0.75rem; font-size: 0.9rem; color: #9ca3af;">
                    <span>📏 Size: {size_display}</span>
                    <span>⚡ Velocity: {asteroid['velocity_kms']} km/s</span>
                    <span>📅 In {days_until} days</span>
                    <span>🎯 Distance: {dist_display}</span>
                </div>
            </div>
            """, unsafe_allow_html=True)

            # Track button (PRO feature for full tracking)
            col_track, col_info = st.columns([1, 3])
            with col_track:
                if has_pro_access or len(st.session_state["tracked_asteroids"]) < 3:
                    if is_tracked:
                        if st.button(f"Untrack", key=f"untrack_{asteroid['name']}"):
                            st.session_state["tracked_asteroids"].remove(asteroid["name"])
                            st.rerun()
                    else:
                        if st.button(f"Track", key=f"track_{asteroid['name']}"):
                            st.session_state["tracked_asteroids"].append(asteroid["name"])
                            st.session_state["asteroid_alerts"].append({
                                "asteroid": asteroid["name"],
                                "message": f"Now tracking {asteroid['name']}!",
                                "time": datetime.now()
                            })
                            st.rerun()
                else:
                    st.caption("⭐ PRO: Track unlimited")

    elif view_mode == "📅 Upcoming Approaches":
        st.subheader("📅 Upcoming Close Approaches")

        # Filter options
        col_f1, col_f2 = st.columns(2)
        with col_f1:
            time_filter = st.selectbox("Time Range:", ["Next 7 days", "Next 30 days", "Next 90 days", "All"])
        with col_f2:
            threat_filter = st.multiselect("Threat Level:", ["CRITICAL", "HIGH", "MODERATE", "LOW", "MINIMAL"],
                                           default=["CRITICAL", "HIGH", "MODERATE"])

        # Filter asteroids
        filtered = asteroids.copy()
        if time_filter == "Next 7 days":
            filtered = [a for a in filtered if (a["close_approach"] - datetime.now()).days <= 7]
        elif time_filter == "Next 30 days":
            filtered = [a for a in filtered if (a["close_approach"] - datetime.now()).days <= 30]
        elif time_filter == "Next 90 days":
            filtered = [a for a in filtered if (a["close_approach"] - datetime.now()).days <= 90]

        if threat_filter:
            filtered = [a for a in filtered if a["threat_level"] in threat_filter]

        if not filtered:
            st.info("No asteroids match your filters.")
        else:
            # Create timeline visualization
            st.markdown("### Approach Timeline")

            for asteroid in filtered[:15]:
                days_until = (asteroid["close_approach"] - datetime.now()).days
                progress = max(0, min(1, 1 - days_until / 365))

                st.markdown(f"""
                <div style="margin: 0.75rem 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span style="font-weight: bold;">{asteroid['name']}</span>
                        <span style="color: {asteroid['threat_color']};">{asteroid['threat_level']}</span>
                    </div>
                    <div style="background: rgba(99, 102, 241, 0.2); border-radius: 4px; height: 20px; position: relative;">
                        <div style="background: linear-gradient(90deg, #22c55e, {asteroid['threat_color']}); width: {progress*100}%; height: 100%; border-radius: 4px;"></div>
                        <span style="position: absolute; right: 8px; top: 2px; font-size: 0.75rem; color: white;">
                            {asteroid['close_approach'].strftime('%b %d, %Y')} ({days_until}d)
                        </span>
                    </div>
                    <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 0.25rem;">
                        Size: {asteroid['size_m']}m | Distance: {asteroid['min_distance_km']:,} km | Velocity: {asteroid['velocity_kms']} km/s
                    </div>
                </div>
                """, unsafe_allow_html=True)

    elif view_mode == "⭐ Famous Asteroids":
        st.subheader("⭐ Famous Asteroids & Fun Facts")

        famous_asteroids = [a for a in asteroids if a["is_famous"]]

        for asteroid in famous_asteroids:
            facts = ASTEROID_FUN_FACTS.get(asteroid["name"], {})

            st.markdown(f"""
            <div style="background: linear-gradient(135deg, rgba(212, 168, 83, 0.1), rgba(6, 147, 227, 0.1));
                        border: 2px solid rgba(212, 168, 83, 0.4); border-radius: 16px; padding: 1.5rem; margin: 1rem 0;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; background: linear-gradient(135deg, #d4a853, #0693e3); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        🌟 {asteroid['name']}
                    </h3>
                    <span style="background: {asteroid['threat_color']}; color: white; padding: 4px 12px; border-radius: 8px;">
                        {asteroid['threat_level']}
                    </span>
                </div>
            </div>
            """, unsafe_allow_html=True)

            col1, col2 = st.columns([1, 2])

            with col1:
                st.metric("Size", f"{asteroid['size_m']:,} m")
                st.metric("Velocity", f"{asteroid['velocity_kms']} km/s")
                st.metric("Next Approach", asteroid['close_approach'].strftime('%b %d, %Y'))

            with col2:
                if facts:
                    st.markdown(f"""
                    **Discovery:** {facts.get('discovery', 'Unknown')}

                    **Named After:** {facts.get('named_after', 'Unknown')}

                    **Mission:** {facts.get('mission', 'No dedicated mission')}

                    **Composition:** {facts.get('composition', 'Unknown')}

                    **Fun Fact:** {facts.get('fun_fact', 'No fun fact available')}
                    """)

            st.markdown("---")

        # Additional fun facts section
        with st.expander("🎓 Learn More About Asteroids"):
            st.markdown("""
            ### Asteroid Classification

            **By Composition:**
            - **C-type (Carbonaceous):** Dark, carbon-rich, most common (~75%)
            - **S-type (Silicaceous):** Stony, silicon-rich (~17%)
            - **M-type (Metallic):** Iron-nickel core remnants (~8%)

            ### Famous Asteroid Facts

            - **Largest Asteroid:** Ceres (939 km diameter) - now classified as a dwarf planet!
            - **First Asteroid Visited:** 951 Gaspra by Galileo spacecraft (1991)
            - **Asteroid Belt Mass:** Only 4% of the Moon's mass combined
            - **Closest Approach Ever:** 2020 QG passed just 2,950 km from Earth!

            ### The Torino Scale
            The Torino Scale rates asteroid impact hazard from 0-10:
            - **0 (White):** No hazard
            - **1 (Green):** Normal discovery, no unusual concern
            - **2-4 (Yellow):** Merits attention
            - **5-7 (Orange):** Threatening
            - **8-10 (Red):** Certain collision

            Currently, no known asteroid rates above 0 on the Torino Scale!
            """)

    elif view_mode == "🔔 My Tracked Objects":
        st.subheader("🔔 Your Tracked Asteroids")

        if not has_pro_access:
            st.info(f"⭐ Free users can track up to 3 asteroids. Upgrade to PRO for unlimited tracking and custom alerts!")

        if not st.session_state["tracked_asteroids"]:
            st.markdown("""
            <div style="text-align: center; padding: 3rem; background: rgba(99, 102, 241, 0.1); border-radius: 12px;">
                <div style="font-size: 3rem;">🔭</div>
                <h3>No Asteroids Tracked Yet</h3>
                <p style="color: #9ca3af;">Go to the Threat Dashboard and click "Track" on any asteroid to start monitoring it!</p>
            </div>
            """, unsafe_allow_html=True)
        else:
            # Show alerts
            if st.session_state["asteroid_alerts"]:
                st.markdown("### Recent Alerts")
                for alert in st.session_state["asteroid_alerts"][-5:]:
                    st.info(f"🔔 {alert['message']} - {alert['time'].strftime('%H:%M')}")

            st.markdown("### Your Tracked Objects")

            tracked_data = [a for a in asteroids if a["name"] in st.session_state["tracked_asteroids"]]

            for asteroid in tracked_data:
                days_until = (asteroid["close_approach"] - datetime.now()).days

                # Generate alert if approaching soon
                if days_until <= 7 and asteroid["threat_level"] in ["CRITICAL", "HIGH"]:
                    alert_msg = f"⚠️ {asteroid['name']} approaching in {days_until} days!"
                    if not any(a["message"] == alert_msg for a in st.session_state["asteroid_alerts"]):
                        st.session_state["asteroid_alerts"].append({
                            "asteroid": asteroid["name"],
                            "message": alert_msg,
                            "time": datetime.now()
                        })

                st.markdown(f"""
                <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba({asteroid['threat_color'][1:]}, 0.1));
                            border: 2px solid #fbbf24; border-radius: 12px; padding: 1rem; margin: 0.5rem 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="font-size: 1.2rem; font-weight: bold;">🔔 {asteroid['name']}</span>
                            <span style="background: {asteroid['threat_color']}; color: white; padding: 2px 8px; border-radius: 4px; margin-left: 8px;">{asteroid['threat_level']}</span>
                        </div>
                        <div style="color: #fbbf24; font-weight: bold;">
                            {days_until} days until approach
                        </div>
                    </div>
                    <div style="margin-top: 0.75rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; font-size: 0.85rem; color: #9ca3af;">
                        <span>📏 {asteroid['size_m']}m</span>
                        <span>⚡ {asteroid['velocity_kms']} km/s</span>
                        <span>🎯 {asteroid['min_distance_km']:,} km</span>
                        <span>📅 {asteroid['close_approach'].strftime('%b %d')}</span>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                if st.button(f"Stop Tracking {asteroid['name']}", key=f"stop_{asteroid['name']}"):
                    st.session_state["tracked_asteroids"].remove(asteroid["name"])
                    st.rerun()

            # PRO feature: Custom alert settings
            if has_pro_access:
                st.markdown("---")
                st.markdown("### ⭐ PRO: Alert Settings")

                col1, col2 = st.columns(2)
                with col1:
                    st.selectbox("Alert Threshold:", ["CRITICAL only", "HIGH and above", "MODERATE and above", "All threats"], key="asteroid_alert_threshold")
                with col2:
                    st.selectbox("Alert Timing:", ["1 day before", "3 days before", "7 days before", "14 days before"], key="asteroid_alert_timing")

                st.checkbox("Email notifications", value=False, disabled=True, key="asteroid_email_notif")
                st.caption("Email notifications coming soon!")

    # Educational sidebar content
    st.markdown("---")
    with st.expander("🛡️ Planetary Defense: How We Protect Earth"):
        st.markdown("""
        ### Active Planetary Defense Programs

        **NASA's Planetary Defense Coordination Office (PDCO):**
        - Monitors all known NEO threats
        - Coordinates international response plans
        - Funds asteroid detection surveys

        **DART Mission Success (2022):**
        NASA's Double Asteroid Redirection Test successfully changed the orbit of asteroid Dimorphos by impacting it at 14,000 mph - proving we CAN deflect asteroids!

        **Detection Systems:**
        - **Pan-STARRS:** Surveys sky from Hawaii
        - **Catalina Sky Survey:** Arizona-based detection
        - **ATLAS:** All-sky monitoring network
        - **NEOCam (upcoming):** Space-based infrared telescope

        ### Impact Statistics
        - **Every day:** ~100 tons of cosmic dust hits Earth
        - **Annually:** ~30 small asteroids burn up in atmosphere
        - **Every 2,000 years:** Football field-sized impact on average
        - **Every 500,000 years:** Civilization-threatening impact

        **Good news:** We've found ~95% of civilization-ending asteroids (1km+), and NONE are on collision course!
        """)


# Footer
st.markdown("---")
st.markdown(f"""
<div style="text-align: center; padding: 1.5rem;">
    <div style="margin-bottom: 0.75rem;">
        <img src="data:image/svg+xml;base64,{LOGO_BASE64}" width="50">
    </div>
    <h3 style="background: linear-gradient(135deg, #0693e3 0%, #6366f1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem;">AstroData</h3>
    <p style="color: #9ca3af; margin-bottom: 1rem;">Democratizing Space Education Worldwide</p>
    <div style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin-bottom: 1rem;">
        <span style="color: #a78bfa;">✨ 150+ Locations</span>
        <span style="color: #0693e3;">🔭 Real Science</span>
        <span style="color: #22c55e;">📊 Real-time Data</span>
    </div>
    <p style="color: #6b7280; font-size: 0.8rem;">For curious minds and astronomy learners</p>
    <div style="margin-top: 1rem;">
        <a href="https://laruneng.com" target="_blank" style="color: #0693e3; text-decoration: none; font-size: 0.85rem;">Larun Engineering</a>
    </div>
    <p style="color: #4b5563; font-size: 0.7rem; margin-top: 0.75rem;">Made with ✨ for cosmic explorers everywhere</p>
</div>
""", unsafe_allow_html=True)
