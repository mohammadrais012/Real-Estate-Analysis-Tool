import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# -----------------------------------------------------------------------------
# PAGE CONFIGURATION
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Real Estate Market Dashboard",
    layout="wide",
    initial_sidebar_state="expanded"
)

# -----------------------------------------------------------------------------
# CORPORATE BI DESIGN SYSTEM (POWER BI / TABLEAU VISUAL LANGUAGE)
# Palette:
#   Background: #FFFFFF
#   Primary Blue: #2563EB
#   Dark Blue: #1E3A8A
#   Light Blue: #EFF6FF
#   Text: #1F2937
#   Secondary Text: #6B7280
#   Border: #E5E7EB
#   Success Green: #16A34A
#   Light Green: #DCFCE7
# -----------------------------------------------------------------------------
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Inter', Arial, sans-serif;
        color: #1F2937;
        background-color: #FFFFFF;
        font-size: 13.5px;
    }

    .stApp {
        background-color: #FFFFFF;
    }

    /* Compact main container padding */
    .block-container {
        padding-top: 1.25rem !important;
        padding-bottom: 2rem !important;
        padding-left: 1.75rem !important;
        padding-right: 1.75rem !important;
        max-width: 100% !important;
    }

    /* Sidebar Styling (240px width feel, light border, clean nav) */
    section[data-testid="stSidebar"] {
        background-color: #FFFFFF !important;
        border-right: 1px solid #E5E7EB !important;
        width: 245px !important;
    }

    /* Sidebar Brand Header */
    .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 0 16px 0;
        border-bottom: 1px solid #E5E7EB;
        margin-bottom: 14px;
    }
    .sidebar-brand-icon {
        width: 30px;
        height: 30px;
        background-color: #2563EB;
        color: #FFFFFF;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
    }
    .sidebar-brand-text {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        line-height: 1.25;
        color: #1F2937;
    }

    /* Top Header Bar */
    .top-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 12px;
        border-bottom: 1px solid #E5E7EB;
        margin-bottom: 14px;
    }
    .dashboard-title {
        font-size: 23px;
        font-weight: 600;
        color: #1F2937;
        margin: 0;
        line-height: 1.25;
    }
    .dashboard-subtitle {
        font-size: 13px;
        color: #6B7280;
        margin-top: 2px;
    }
    .header-meta {
        text-align: right;
        font-size: 12.5px;
        color: #6B7280;
        line-height: 1.5;
    }
    .header-meta strong {
        color: #1F2937;
        font-weight: 600;
    }

    /* KPI Card */
    .kpi-card {
        background-color: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 6px;
        padding: 14px 16px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }
    .kpi-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    .kpi-label {
        font-size: 13px;
        font-weight: 500;
        color: #6B7280;
    }
    .kpi-icon {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        background-color: #EFF6FF;
        color: #2563EB;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
    }
    .kpi-value {
        font-size: 26px;
        font-weight: 600;
        color: #1F2937;
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
    }
    .kpi-badge-pos {
        display: inline-block;
        margin-top: 6px;
        padding: 2px 6px;
        font-size: 11.5px;
        font-weight: 600;
        color: #16A34A;
        background-color: #DCFCE7;
        border-radius: 4px;
    }
    .kpi-sub {
        display: inline-block;
        margin-top: 6px;
        font-size: 12px;
        color: #6B7280;
    }

    /* Section Card Wrapper */
    .section-header {
        font-size: 16px;
        font-weight: 600;
        color: #1F2937;
        margin: 18px 0 10px 0;
        padding-bottom: 6px;
        border-bottom: 1px solid #E5E7EB;
    }

    /* Market Insights Card */
    .insights-card {
        background-color: #FFFFFF;
        border: 1px solid #E5E7EB;
        border-radius: 6px;
        padding: 16px 20px;
        margin-top: 8px;
    }
    .insights-title {
        font-size: 15px;
        font-weight: 600;
        color: #1F2937;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #E5E7EB;
    }
    .insight-item {
        display: flex;
        align-items: baseline;
        gap: 8px;
        font-size: 13.5px;
        color: #1F2937;
        padding: 5px 0;
    }
    .insight-bullet {
        color: #2563EB;
        font-weight: 700;
        font-size: 15px;
    }
    .pos-text {
        color: #16A34A;
        font-weight: 600;
    }

    /* Primary Button Styling */
    div.stButton > button[kind="primary"] {
        background-color: #2563EB !important;
        color: #FFFFFF !important;
        border: 1px solid #2563EB !important;
        border-radius: 5px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        padding: 0.4rem 1rem !important;
    }
    div.stButton > button[kind="secondary"] {
        background-color: #FFFFFF !important;
        color: #1F2937 !important;
        border: 1px solid #E5E7EB !important;
        border-radius: 5px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
    }
</style>
""", unsafe_allow_html=True)

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------
def format_inr(val):
    """Formats numeric values cleanly into Indian Rupee business notation (₹ Cr / ₹ L)."""
    if pd.isna(val):
        return "N/A"
    try:
        val = float(val)
    except (ValueError, TypeError):
        return "N/A"

    abs_val = abs(val)
    if abs_val >= 1_00_00_000:
        return f"₹{val / 1_00_00_000:.2f} Cr"
    elif abs_val >= 1_00_000:
        return f"₹{val / 1_00_000:.2f} L"
    elif abs_val >= 1_000:
        return f"₹{val:,.0f}"
    return f"₹{val:,.2f}"


def detect_column(columns, candidates):
    """Automatically detects standard real estate columns from CSV headers."""
    col_map = {c.strip().lower().replace("_", " ").replace("-", " "): c for c in columns}
    for cand in candidates:
        norm_cand = cand.strip().lower().replace("_", " ").replace("-", " ")
        if norm_cand in col_map:
            return col_map[norm_cand]
    for cand in candidates:
        norm_cand = cand.strip().lower().replace("_", " ").replace("-", " ")
        for norm_col, orig_col in col_map.items():
            if norm_cand in norm_col:
                return orig_col
    return None


def parse_numeric_series(series):
    """Extracts numeric values from strings containing currency symbols, commas, or units."""
    if pd.api.types.is_numeric_dtype(series):
        return pd.to_numeric(series, errors="coerce")
    cleaned = (
        series.astype(str)
        .str.replace(",", "", regex=False)
        .str.replace("₹", "", regex=False)
        .str.replace("$", "", regex=False)
        .str.extract(r"([-+]?\d*\.?\d+)")[0]
    )
    return pd.to_numeric(cleaned, errors="coerce")


@st.cache_data(show_spinner=False)
def load_csv(uploaded_file):
    df = pd.read_csv(uploaded_file)
    df.columns = [str(c).strip() for c in df.columns]
    return df


def clean_dataset(df, price_col, area_col, location_col, prop_type_col, bhk_col, date_col):
    """Performs basic business data cleaning with Pandas."""
    total_rows = len(df)
    total_cols = len(df.columns)
    missing_values = int(df.isna().sum().sum())
    duplicate_rows = int(df.duplicated().sum())

    cleaned = df.drop_duplicates().copy()

    if price_col and price_col in cleaned.columns:
        cleaned["_price"] = parse_numeric_series(cleaned[price_col])
        cleaned = cleaned[cleaned["_price"].notna() & (cleaned["_price"] > 0)]

    if area_col and area_col in cleaned.columns:
        cleaned["_area"] = parse_numeric_series(cleaned[area_col])
        cleaned = cleaned[cleaned["_area"].notna() & (cleaned["_area"] > 0)]

    if bhk_col and bhk_col in cleaned.columns:
        cleaned["_bhk"] = parse_numeric_series(cleaned[bhk_col])

    if location_col and location_col in cleaned.columns:
        cleaned["_location"] = (
            cleaned[location_col]
            .fillna("Unspecified")
            .astype(str)
            .str.strip()
            .replace({"": "Unspecified", "nan": "Unspecified"})
        )

    if prop_type_col and prop_type_col in cleaned.columns:
        cleaned["_property_type"] = (
            cleaned[prop_type_col]
            .fillna("Unspecified")
            .astype(str)
            .str.strip()
            .replace({"": "Unspecified", "nan": "Unspecified"})
        )

    if date_col and date_col in cleaned.columns:
        cleaned["_date"] = pd.to_datetime(cleaned[date_col], errors="coerce")

    if "_price" in cleaned.columns and "_area" in cleaned.columns:
        cleaned["_price_per_sqft"] = cleaned["_price"] / cleaned["_area"]

    summary = {
        "total_rows": total_rows,
        "cleaned_rows": len(cleaned),
        "total_cols": total_cols,
        "missing_values": missing_values,
        "duplicate_rows": duplicate_rows,
    }
    return cleaned, summary


def style_bi_chart(fig, title="", height=320):
    """Applies Power BI / Tableau style layout to Plotly figures."""
    fig.update_layout(
        title=dict(
            text=title,
            font=dict(family="Inter, Arial, sans-serif", size=15, color="#1F2937"),
            x=0,
            xanchor="left"
        ),
        template="plotly_white",
        height=height,
        margin=dict(l=16, r=16, t=44, b=20),
        paper_bgcolor="#FFFFFF",
        plot_bgcolor="#FFFFFF",
        font=dict(family="Inter, Arial, sans-serif", size=12, color="#1F2937"),
        xaxis=dict(
            showgrid=True,
            gridcolor="#F3F4F6",
            linecolor="#E5E7EB",
            tickfont=dict(color="#6B7280", size=11),
            zeroline=False
        ),
        yaxis=dict(
            showgrid=True,
            gridcolor="#F3F4F6",
            linecolor="#E5E7EB",
            tickfont=dict(color="#6B7280", size=11),
            zeroline=False
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1,
            font=dict(size=11, color="#6B7280")
        )
    )
    return fig


# -----------------------------------------------------------------------------
# SIDEBAR NAVIGATION
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown(
        '<div class="sidebar-brand">'
        '<div class="sidebar-brand-icon">RE</div>'
        '<div class="sidebar-brand-text">REAL ESTATE<br>ANALYTICS</div>'
        '</div>',
        unsafe_allow_html=True
    )

    nav_section = st.radio(
        "Navigation",
        options=[
            "Dashboard",
            "Market Analysis",
            "Location Analysis",
            "Price Analysis",
            "Property Explorer",
            "Data Quality"
        ],
        label_visibility="collapsed"
    )

    st.markdown("---")
    uploaded_file = st.file_uploader(
        "Upload Real Estate CSV",
        type=["csv"],
        help="Upload a .csv dataset to populate the dashboard."
    )

# -----------------------------------------------------------------------------
# UPLOAD STATE (WHEN NO CSV IS LOADED YET)
# -----------------------------------------------------------------------------
if uploaded_file is None:
    st.markdown(
        '<div class="top-header">'
        '<div>'
        '<h1 class="dashboard-title">Real Estate Market Analysis</h1>'
        '<div class="dashboard-subtitle">Turn property data into clear market insights.</div>'
        '</div>'
        '<div class="header-meta">Dataset: <strong>None loaded</strong></div>'
        '</div>',
        unsafe_allow_html=True
    )

    st.markdown(
        '<div style="background:#FFFFFF; border:1px solid #E5E7EB; border-radius:6px; padding:32px; max-width:720px; margin-top:20px;">'
        '<div style="font-size:16px; font-weight:600; color:#1F2937; margin-bottom:6px;">'
        'Upload Real Estate CSV Dataset'
        '</div>'
        '<div style="font-size:13.5px; color:#6B7280; margin-bottom:16px;">'
        'Use the <strong>Upload Real Estate CSV</strong> control in the left sidebar to load your property dataset (.csv). '
        'The dashboard will automatically detect columns, clean records, and generate interactive analytics.'
        '</div>'
        '<div style="font-size:12.5px; color:#6B7280; background:#EFF6FF; border:1px solid #BFDBFE; color:#1E3A8A; padding:10px 14px; border-radius:4px;">'
        'Supported columns: Price, Area (Sq Ft), Location / Locality, Property Type, BHK / Bedrooms, and optional Date.'
        '</div>'
        '</div>',
        unsafe_allow_html=True
    )
    st.stop()

# -----------------------------------------------------------------------------
# READ & DETECT COLUMNS
# -----------------------------------------------------------------------------
try:
    raw_df = load_csv(uploaded_file)
except Exception as e:
    st.error(f"Error reading CSV file: {e}")
    st.stop()

all_cols = list(raw_df.columns)
opts = ["(Not Available)"] + all_cols

PRICE_CANDIDATES = ["Price", "price", "Property Price", "Sale Price", "Selling Price", "Amount", "Sale_Price"]
AREA_CANDIDATES = ["Area", "area", "Sqft", "Square Feet", "Area Sq Ft", "Built Up Area", "Carpet Area"]
LOCATION_CANDIDATES = ["Location", "Locality", "Area Name", "City", "Neighborhood", "Region"]
TYPE_CANDIDATES = ["Property Type", "Type", "Property_Type", "Category", "Home Type"]
BHK_CANDIDATES = ["BHK", "Bedrooms", "Bedroom", "Beds", "Rooms"]
DATE_CANDIDATES = ["Date", "Listing Date", "Sale Date", "Transaction Date", "Month", "Year"]

det_price = detect_column(all_cols, PRICE_CANDIDATES)
det_area = detect_column(all_cols, AREA_CANDIDATES)
det_loc = detect_column(all_cols, LOCATION_CANDIDATES)
det_type = detect_column(all_cols, TYPE_CANDIDATES)
det_bhk = detect_column(all_cols, BHK_CANDIDATES)
det_date = detect_column(all_cols, DATE_CANDIDATES)

with st.sidebar.expander("Column Mapping", expanded=False):
    price_col = st.selectbox("Price", opts, index=opts.index(det_price) if det_price in opts else 0)
    area_col = st.selectbox("Area (Sq Ft)", opts, index=opts.index(det_area) if det_area in opts else 0)
    location_col = st.selectbox("Location", opts, index=opts.index(det_loc) if det_loc in opts else 0)
    prop_type_col = st.selectbox("Property Type", opts, index=opts.index(det_type) if det_type in opts else 0)
    bhk_col = st.selectbox("BHK", opts, index=opts.index(det_bhk) if det_bhk in opts else 0)
    date_col = st.selectbox("Date (Optional)", opts, index=opts.index(det_date) if det_date in opts else 0)

price_col = None if price_col == "(Not Available)" else price_col
area_col = None if area_col == "(Not Available)" else area_col
location_col = None if location_col == "(Not Available)" else location_col
prop_type_col = None if prop_type_col == "(Not Available)" else prop_type_col
bhk_col = None if bhk_col == "(Not Available)" else bhk_col
date_col = None if date_col == "(Not Available)" else date_col

cleaned_df, quality_summary = clean_dataset(
    raw_df, price_col, area_col, location_col, prop_type_col, bhk_col, date_col
)

# -----------------------------------------------------------------------------
# TOP HEADER
# -----------------------------------------------------------------------------
st.markdown(
    f'<div class="top-header">'
    f'<div>'
    f'<h1 class="dashboard-title">Real Estate Market Dashboard</h1>'
    f'<div class="dashboard-subtitle">Market overview and property insights</div>'
    f'</div>'
    f'<div class="header-meta">'
    f'Dataset: <strong>{uploaded_file.name}</strong><br>'
    f'Records: <strong>{len(cleaned_df):,}</strong> &nbsp;|&nbsp; Last Updated: <strong>Current Session</strong>'
    f'</div>'
    f'</div>',
    unsafe_allow_html=True
)

# -----------------------------------------------------------------------------
# HORIZONTAL FILTER BAR
# -----------------------------------------------------------------------------
if "reset_counter" not in st.session_state:
    st.session_state.reset_counter = 0

rk = st.session_state.reset_counter
filtered_df = cleaned_df.copy()

f_col1, f_col2, f_col3, f_col4, f_col5 = st.columns([2, 2, 1.5, 2.5, 1])

with f_col1:
    if "_location" in filtered_df.columns:
        locs = ["All"] + sorted(cleaned_df["_location"].dropna().unique().tolist())
        sel_loc = st.selectbox("Location", locs, key=f"loc_{rk}")
        if sel_loc != "All":
            filtered_df = filtered_df[filtered_df["_location"] == sel_loc]

with f_col2:
    if "_property_type" in filtered_df.columns:
        types = ["All"] + sorted(cleaned_df["_property_type"].dropna().unique().tolist())
        sel_type = st.selectbox("Property Type", types, key=f"type_{rk}")
        if sel_type != "All":
            filtered_df = filtered_df[filtered_df["_property_type"] == sel_type]

with f_col3:
    if "_bhk" in filtered_df.columns and cleaned_df["_bhk"].notna().any():
        bhks = ["All"] + [str(int(b)) for b in sorted(cleaned_df["_bhk"].dropna().round().unique())]
        sel_bhk = st.selectbox("BHK", bhks, key=f"bhk_{rk}")
        if sel_bhk != "All":
            filtered_df = filtered_df[filtered_df["_bhk"].round() == int(sel_bhk)]

with f_col4:
    if "_price" in filtered_df.columns and cleaned_df["_price"].notna().any():
        min_p = float(cleaned_df["_price"].min())
        max_p = float(cleaned_df["_price"].max())
        if max_p > min_p:
            p_range = st.slider(
                "Price Range",
                min_value=min_p,
                max_value=max_p,
                value=(min_p, max_p),
                key=f"pr_{rk}"
            )
            filtered_df = filtered_df[
                (filtered_df["_price"] >= p_range[0]) & (filtered_df["_price"] <= p_range[1])
            ]

with f_col5:
    st.write("")
    if st.button("Reset Filters", type="secondary", use_container_width=True):
        st.session_state.reset_counter += 1
        st.rerun()

if filtered_df.empty:
    st.warning("No records match the selected filters. Click Reset Filters to restore all data.")
    st.stop()

# -----------------------------------------------------------------------------
# KPI CARDS ROW (4 CARDS)
# -----------------------------------------------------------------------------
k1, k2, k3, k4 = st.columns(4)

with k1:
    share_pct = (len(filtered_df) / len(cleaned_df) * 100) if len(cleaned_df) > 0 else 100
    st.markdown(
        f'<div class="kpi-card">'
        f'<div class="kpi-top"><span class="kpi-label">Total Properties</span><span class="kpi-icon">#</span></div>'
        f'<div class="kpi-value">{len(filtered_df):,}</div>'
        f'<div class="kpi-badge-pos">↑ {share_pct:.1f}% of dataset</div>'
        f'</div>',
        unsafe_allow_html=True
    )

with k2:
    if "_price" in filtered_df.columns:
        avg_p = filtered_df["_price"].mean()
        med_p = filtered_df["_price"].median()
        st.markdown(
            f'<div class="kpi-card">'
            f'<div class="kpi-top"><span class="kpi-label">Average Property Price</span><span class="kpi-icon">₹</span></div>'
            f'<div class="kpi-value">{format_inr(avg_p)}</div>'
            f'<div class="kpi-sub">Median: {format_inr(med_p)}</div>'
            f'</div>',
            unsafe_allow_html=True
        )

with k3:
    if "_price_per_sqft" in filtered_df.columns:
        avg_pps = filtered_df["_price_per_sqft"].mean()
        st.markdown(
            f'<div class="kpi-card">'
            f'<div class="kpi-top"><span class="kpi-label">Average Price / Sq Ft</span><span class="kpi-icon">⊞</span></div>'
            f'<div class="kpi-value">₹{avg_pps:,.0f}</div>'
            f'<div class="kpi-sub">Per sq ft unit rate</div>'
            f'</div>',
            unsafe_allow_html=True
        )
    elif "_area" in filtered_df.columns:
        avg_a = filtered_df["_area"].mean()
        st.markdown(
            f'<div class="kpi-card">'
            f'<div class="kpi-top"><span class="kpi-label">Average Area</span><span class="kpi-icon">⊞</span></div>'
            f'<div class="kpi-value">{avg_a:,.0f} sqft</div>'
            f'<div class="kpi-sub">Mean property size</div>'
            f'</div>',
            unsafe_allow_html=True
        )

with k4:
    if "_location" in filtered_df.columns:
        loc_cnt = filtered_df["_location"].nunique()
        st.markdown(
            f'<div class="kpi-card">'
            f'<div class="kpi-top"><span class="kpi-label">Total Locations</span><span class="kpi-icon">◎</span></div>'
            f'<div class="kpi-value">{loc_cnt:,}</div>'
            f'<div class="kpi-sub">Active localities analyzed</div>'
            f'</div>',
            unsafe_allow_html=True
        )

st.write("")

# -----------------------------------------------------------------------------
# RENDER SECTIONS BASED ON SIDEBAR NAVIGATION
# -----------------------------------------------------------------------------
show_all = nav_section == "Dashboard"

# 1. MARKET OVERVIEW (Price Trend / Distribution + Property Types)
if show_all or nav_section == "Market Analysis":
    r1_c1, r1_c2 = st.columns([1.6, 1])

    with r1_c1:
        if "_date" in filtered_df.columns and filtered_df["_date"].notna().sum() >= 3 and "_price" in filtered_df.columns:
            trend_df = (
                filtered_df.dropna(subset=["_date", "_price"])
                .groupby(pd.Grouper(key="_date", freq="M"))["_price"]
                .mean()
                .dropna()
                .reset_index()
            )
            fig_trend = px.line(
                trend_df,
                x="_date",
                y="_price",
                markers=True,
                labels={"_date": "Date", "_price": "Average Price"},
                color_discrete_sequence=["#2563EB"]
            )
            st.plotly_chart(style_bi_chart(fig_trend, "Property Price Trend", 320), use_container_width=True)
        elif "_price" in filtered_df.columns:
            fig_dist = px.histogram(
                filtered_df,
                x="_price",
                nbins=25,
                labels={"_price": "Property Price", "count": "Properties"},
                color_discrete_sequence=["#2563EB"]
            )
            fig_dist.update_traces(marker_line_color="#FFFFFF", marker_line_width=1)
            st.plotly_chart(style_bi_chart(fig_dist, "Property Price Distribution", 320), use_container_width=True)

    with r1_c2:
        if "_property_type" in filtered_df.columns:
            type_df = filtered_df["_property_type"].value_counts().reset_index()
            type_df.columns = ["Property Type", "Count"]
            blue_shades = ["#1E3A8A", "#2563EB", "#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"]
            fig_donut = px.pie(
                type_df,
                names="Property Type",
                values="Count",
                hole=0.55,
                color_discrete_sequence=blue_shades
            )
            fig_donut.update_traces(textposition="inside", textinfo="percent+label")
            st.plotly_chart(style_bi_chart(fig_donut, "Property Type Distribution", 320), use_container_width=True)

# 2. LOCATION ANALYSIS
if (show_all or nav_section == "Location Analysis") and "_location" in filtered_df.columns:
    top_n_col1, top_n_col2 = st.columns([3, 1])
    with top_n_col2:
        top_n = st.selectbox("Display Locations", [5, 10, 15], index=1, format_func=lambda x: f"Top {x} Locations")

    if "_price" in filtered_df.columns:
        loc_price = (
            filtered_df.groupby("_location", as_index=False)["_price"]
            .mean()
            .sort_values("_price", ascending=False)
            .head(top_n)
            .sort_values("_price", ascending=True)
        )
        loc_price["Formatted"] = loc_price["_price"].apply(format_inr)
        fig_loc = px.bar(
            loc_price,
            x="_price",
            y="_location",
            orientation="h",
            text="Formatted",
            labels={"_price": "Average Price", "_location": "Location"},
            color_discrete_sequence=["#2563EB"]
        )
        fig_loc.update_traces(textposition="outside")
        st.plotly_chart(style_bi_chart(fig_loc, f"Average Property Price by Location (Top {top_n})", 350), use_container_width=True)

# 3. PRICE & PROPERTY ANALYSIS (Price vs Area Scatter + BHK Analysis)
if (show_all or nav_section == "Price Analysis") and "_price" in filtered_df.columns:
    p_col1, p_col2 = st.columns(2)

    with p_col1:
        if "_area" in filtered_df.columns:
            fig_scatter = px.scatter(
                filtered_df,
                x="_area",
                y="_price",
                labels={"_area": "Area (sq ft)", "_price": "Price"},
                color_discrete_sequence=["#2563EB"],
                opacity=0.65
            )
            st.plotly_chart(style_bi_chart(fig_scatter, "Price vs Area (Sq Ft)", 330), use_container_width=True)

    with p_col2:
        if "_bhk" in filtered_df.columns and filtered_df["_bhk"].notna().any():
            bhk_df = (
                filtered_df.dropna(subset=["_bhk"])
                .assign(BHK=lambda d: d["_bhk"].round().astype(int).astype(str) + " BHK")
                .groupby("BHK", as_index=False)
                .agg(Count=("_price", "count"), AvgPrice=("_price", "mean"))
            )
            fig_bhk = px.bar(
                bhk_df,
                x="BHK",
                y="Count",
                labels={"BHK": "BHK Configuration", "Count": "Number of Properties"},
                color_discrete_sequence=["#2563EB"]
            )
            st.plotly_chart(style_bi_chart(fig_bhk, "BHK Analysis (Listings by Configuration)", 330), use_container_width=True)

# 4. KEY MARKET INSIGHTS
if show_all or nav_section in ["Market Analysis", "Location Analysis", "Price Analysis"]:
    insights_html = []

    if "_location" in filtered_df.columns and "_price_per_sqft" in filtered_df.columns:
        loc_pps = filtered_df.groupby("_location")["_price_per_sqft"].mean()
        if not loc_pps.empty:
            best_loc = loc_pps.idxmax()
            best_val = loc_pps.max()
            insights_html.append(
                f'<div class="insight-item"><span class="insight-bullet">•</span>'
                f'<span><strong>{best_loc}</strong> has the highest average price per sq ft at '
                f'<span class="pos-text">₹{best_val:,.0f} / sqft</span>.</span></div>'
            )

    if "_location" in filtered_df.columns and "_price" in filtered_df.columns:
        loc_p = filtered_df.groupby("_location")["_price"].mean()
        if not loc_p.empty:
            top_l = loc_p.idxmax()
            top_v = loc_p.max()
            insights_html.append(
                f'<div class="insight-item"><span class="insight-bullet">•</span>'
                f'<span><strong>{top_l}</strong> records the highest average property valuation at '
                f'<strong>{format_inr(top_v)}</strong>.</span></div>'
            )

    if "_bhk" in filtered_df.columns and filtered_df["_bhk"].notna().any():
        bhk_counts = filtered_df["_bhk"].dropna().round().astype(int).value_counts()
        if not bhk_counts.empty:
            top_bhk = bhk_counts.index[0]
            share = (bhk_counts.iloc[0] / len(filtered_df)) * 100
            insights_html.append(
                f'<div class="insight-item"><span class="insight-bullet">•</span>'
                f'<span><strong>{top_bhk} BHK</strong> properties represent the largest share of listings '
                f'(<span class="pos-text">{share:.1f}%</span> of active inventory).</span></div>'
            )

    if "_price" in filtered_df.columns and "_area" in filtered_df.columns and len(filtered_df) > 2:
        corr = filtered_df["_price"].corr(filtered_df["_area"])
        if pd.notna(corr):
            trend_label = "a positive relationship" if corr > 0.2 else "a moderate relationship"
            insights_html.append(
                f'<div class="insight-item"><span class="insight-bullet">•</span>'
                f'<span>Larger properties show <span class="pos-text">{trend_label}</span> with total price '
                f'(correlation r = {corr:.2f}).</span></div>'
            )

    if insights_html:
        st.markdown(
            f'<div class="insights-card">'
            f'<div class="insights-title">Market Insights</div>'
            f'{"".join(insights_html)}'
            f'</div>',
            unsafe_allow_html=True
        )

# 5. DATA QUALITY VIEW
if nav_section == "Data Quality":
    st.markdown('<div class="section-header">Data Quality Summary</div>', unsafe_allow_html=True)
    dq1, dq2, dq3, dq4 = st.columns(4)
    dq1.metric("Total Raw Rows", f"{quality_summary['total_rows']:,}")
    dq2.metric("Total Columns", f"{quality_summary['total_cols']:,}")
    dq3.metric("Missing Values Detected", f"{quality_summary['missing_values']:,}")
    dq4.metric("Duplicate Rows Removed", f"{quality_summary['duplicate_rows']:,}")

# 6. PROPERTY EXPLORER TABLE
if show_all or nav_section == "Property Explorer":
    st.markdown('<div class="section-header">Property Explorer</div>', unsafe_allow_html=True)

    internal_cols = ["_price", "_area", "_bhk", "_location", "_property_type", "_price_per_sqft", "_date"]
    display_df = filtered_df.drop(columns=[c for c in internal_cols if c in filtered_df.columns]).copy()
    if "_price_per_sqft" in filtered_df.columns:
        display_df["Price / Sq Ft"] = filtered_df["_price_per_sqft"].round(0)

    st.dataframe(display_df, use_container_width=True, height=380)

    csv_data = display_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="Download CSV",
        data=csv_data,
        file_name="filtered_real_estate_data.csv",
        mime="text/csv",
        type="primary"
    )
