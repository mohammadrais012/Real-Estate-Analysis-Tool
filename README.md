# Real Estate Market Analysis Tool

A Business Analytics & Exploratory Data Analysis (EDA) dashboard built with **Python**, **Streamlit**, **Pandas**, and **Plotly**.

## Project Overview

This application allows business users and analysts to upload any Real Estate `.csv` dataset and automatically generates an interactive Business Intelligence dashboard. The uploaded CSV file serves as the single source of truth.

### Main Workflow
1. **Upload CSV**: Upload any real estate property dataset (`.csv`).
2. **Read Data**: Inspect rows, columns, and raw data preview.
3. **Basic Data Cleaning**: Automatically remove duplicate rows, handle missing values, clean column headers, and parse numeric values (`Price`, `Area`, `BHK`).
4. **Analyze Data**: Automatically detect common real estate columns (`Price`, `Area`, `Location`, `Property Type`, `BHK`) with manual dropdown overrides if custom column headers are used.
5. **Generate Dashboard**: Explore interactive KPI cards, sidebar filters, and Plotly charts across Market Overview, Location Analysis, and Price & Property Analysis.
6. **Business Insights & Export**: Read dynamic rule-based business insights calculated via Pandas and download the filtered dataset as a new CSV.

---

## Project Structure

```text
real_estate_market_analysis/
│
├── app.py
├── requirements.txt
└── README.md
```

---

## How to Run Locally

1. **Install the required Python packages**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Streamlit application**:
   ```bash
   streamlit run app.py
   ```

3. **Open in Browser**:
   Streamlit will automatically launch the dashboard at `http://localhost:8501`.
