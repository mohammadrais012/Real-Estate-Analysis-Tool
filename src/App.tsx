import React, { useState, useMemo, useRef } from 'react';
import {
  Building2,
  LayoutDashboard,
  TrendingUp,
  MapPin,
  BarChart3,
  Table as TableIcon,
  ShieldCheck,
  Upload,
  RotateCcw,
  Download,
  ArrowUpDown,
  Search,
  Home,
  IndianRupee,
  Maximize2,
  SlidersHorizontal,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

// -----------------------------------------------------------------------------
// SAMPLE REAL ESTATE CSV (FOR QUICK TESTING IF USER DOES NOT HAVE A FILE READY)
// Includes Date, Location, Property Type, BHK, Area, and Price
// -----------------------------------------------------------------------------
const SAMPLE_REAL_ESTATE_CSV = `Property_ID,Date,Location,Property Type,BHK,Area,Price
RE-1001,2026-01-15,Whitefield,Apartment,2,1180,8250000
RE-1002,2026-01-22,Indiranagar,Apartment,3,1850,21500000
RE-1003,2026-01-28,Sarjapur Road,Apartment,2,1120,7400000
RE-1004,2026-02-05,Koramangala,Apartment,3,1720,19800000
RE-1005,2026-02-14,Electronic City,Apartment,2,1040,5200000
RE-1006,2026-02-19,HSR Layout,Apartment,2,1280,12600000
RE-1007,2026-02-25,Hebbal,Apartment,3,1760,15900000
RE-1008,2026-03-04,Whitefield,Villa,4,2920,27500000
RE-1009,2026-03-11,Bellandur,Apartment,2,1210,9400000
RE-1010,2026-03-18,Jayanagar,Independent House,4,2750,36500000
RE-1011,2026-03-26,Marathahalli,Apartment,2,1150,7850000
RE-1012,2026-04-02,Yelahanka,Villa,4,2850,24800000
RE-1013,2026-04-09,JP Nagar,Apartment,3,1640,13200000
RE-1014,2026-04-16,Bannerghatta Road,Apartment,2,1160,7750000
RE-1015,2026-04-24,Whitefield,Apartment,3,1650,12600000
RE-1016,2026-05-03,HSR Layout,Apartment,3,1690,18100000
RE-1017,2026-05-11,Sarjapur Road,Villa,4,2680,25200000
RE-1018,2026-05-19,Electronic City,Apartment,1,690,3750000
RE-1019,2026-05-27,Electronic City,Apartment,3,1430,7450000
RE-1020,2026-06-04,Indiranagar,Villa,4,3100,45800000
RE-1021,2026-06-12,Koramangala,Plot,3,2400,31200000
RE-1022,2026-06-18,Bellandur,Apartment,3,1610,13800000
RE-1023,2026-06-25,Hebbal,Villa,4,3300,36900000
RE-1024,2026-07-03,JP Nagar,Independent House,4,2500,26800000
RE-1025,2026-07-10,Yelahanka,Apartment,2,1190,7100000
RE-1026,2026-07-17,Marathahalli,Apartment,3,1520,11100000
RE-1027,2026-07-23,Bannerghatta Road,Villa,3,2280,18900000
RE-1028,2026-08-02,Whitefield,Apartment,2,1220,8950000
RE-1029,2026-08-09,Sarjapur Road,Apartment,3,1560,11600000
RE-1030,2026-08-15,HSR Layout,Independent House,3,1880,21400000
RE-1031,2026-08-21,Koramangala,Apartment,3,1790,22400000
RE-1032,2026-08-28,Jayanagar,Apartment,3,1760,22100000
RE-1033,2026-09-04,Hebbal,Apartment,2,1290,11800000
RE-1034,2026-09-11,Bellandur,Apartment,3,1680,14600000
RE-1035,2026-09-18,Indiranagar,Apartment,3,1910,24800000
RE-1036,2026-09-24,Whitefield,Plot,3,2400,19200000`;

// -----------------------------------------------------------------------------
// DATA TYPES & COLUMN CANDIDATES
// -----------------------------------------------------------------------------
type RawRow = Record<string, string>;

type NavSection =
  | 'Dashboard'
  | 'Market Analysis'
  | 'Location Analysis'
  | 'Price Analysis'
  | 'Property Explorer'
  | 'Data Quality';

interface CleanedRow {
  original: RawRow;
  _price: number | null;
  _area: number | null;
  _bhk: number | null;
  _location: string | null;
  _property_type: string | null;
  _price_per_sqft: number | null;
  _date: string | null; // YYYY-MM format if valid date
  _rawDate: Date | null;
}

interface QualitySummary {
  totalRows: number;
  cleanedRows: number;
  totalCols: number;
  missingValues: number;
  duplicateRows: number;
}

const PRICE_CANDIDATES = ['Price', 'price', 'Property Price', 'Sale Price', 'Selling Price', 'Amount', 'Sale_Price', 'Total Price'];
const AREA_CANDIDATES = ['Area', 'area', 'Sqft', 'Square Feet', 'Area Sq Ft', 'Built Up Area', 'Super Area', 'Carpet Area', 'Size'];
const LOCATION_CANDIDATES = ['Location', 'Locality', 'Area Name', 'City', 'Neighborhood', 'Region', 'Suburb'];
const TYPE_CANDIDATES = ['Property Type', 'Type', 'Property_Type', 'Category', 'Building Type', 'Home Type'];
const BHK_CANDIDATES = ['BHK', 'Bedrooms', 'Bedroom', 'Beds', 'No. of Bedrooms', 'Rooms'];
const DATE_CANDIDATES = ['Date', 'date', 'Listing Date', 'Sale Date', 'Transaction Date', 'Month', 'Year_Month', 'Posted Date'];

// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------------
function parseCSVText(text: string): { headers: string[]; rows: RawRow[] } {
  const lines = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const res: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        res.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    res.push(cur.trim());
    return res;
  };

  const rawHeaders = parseLine(lines[0]).map((h, i) => h || `Column_${i + 1}`);
  const rows: RawRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseLine(lines[i]);
    if (vals.length === 1 && vals[0] === '') continue;
    const obj: RawRow = {};
    rawHeaders.forEach((h, idx) => {
      obj[h] = vals[idx] !== undefined ? vals[idx] : '';
    });
    rows.push(obj);
  }

  return { headers: rawHeaders, rows };
}

function detectColumn(columns: string[], candidates: string[]): string {
  const normalizedMap = new Map<string, string>();
  columns.forEach((c) => {
    normalizedMap.set(c.trim().toLowerCase().replace(/[_-]/g, ' '), c);
  });

  for (const cand of candidates) {
    const normCand = cand.trim().toLowerCase().replace(/[_-]/g, ' ');
    if (normalizedMap.has(normCand)) {
      return normalizedMap.get(normCand)!;
    }
  }

  for (const cand of candidates) {
    const normCand = cand.trim().toLowerCase().replace(/[_-]/g, ' ');
    for (const [normCol, origCol] of normalizedMap.entries()) {
      if (normCol.includes(normCand)) {
        return origCol;
      }
    }
  }

  return '';
}

function parseNumericValue(val: string | undefined): number | null {
  if (val === undefined || val === null) return null;
  const cleaned = String(val).replace(/,/g, '').replace(/₹/g, '').replace(/\$/g, '').trim();
  if (!cleaned) return null;
  const match = cleaned.match(/[-+]?\d*\.?\d+/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return Number.isFinite(num) ? num : null;
}

function parseDateMonth(val: string | undefined): { monthKey: string | null; dateObj: Date | null } {
  if (!val) return { monthKey: null, dateObj: null };
  const trimmed = val.trim();
  if (!trimmed) return { monthKey: null, dateObj: null };
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return { monthKey: null, dateObj: null };
  const yyyy = parsed.getFullYear();
  if (yyyy < 1990 || yyyy > 2100) return { monthKey: null, dateObj: null };
  const mm = String(parsed.getMonth() + 1).padStart(2, '0');
  return { monthKey: `${yyyy}-${mm}`, dateObj: parsed };
}

export function formatINR(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) return 'N/A';
  const absVal = Math.abs(val);
  if (absVal >= 1_00_00_000) {
    return `₹${(val / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (absVal >= 1_00_000) {
    return `₹${(val / 1_00_000).toFixed(2)} L`;
  }
  if (absVal >= 1_000) {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  }
  return `₹${val.toFixed(0)}`;
}

function computeMedian(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function computeLinearRegression(xs: number[], ys: number[]): { slope: number; intercept: number; r: number } | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return null;
  const slope = num / denX;
  const intercept = meanY - slope * meanX;
  const r = num / Math.sqrt(denX * denY);
  return { slope, intercept, r };
}

const BLUE_SHADES = ['#1E3A8A', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'];

// -----------------------------------------------------------------------------
// MAIN CORPORATE BI DASHBOARD COMPONENT
// -----------------------------------------------------------------------------
export default function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Navigation State
  const [activeNav, setActiveNav] = useState<NavSection>('Dashboard');

  // Uploaded CSV State
  const [fileName, setFileName] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [uploadError, setUploadError] = useState<string>('');
  const [isDashboardReady, setIsDashboardReady] = useState<boolean>(false);
  const [showMappingModal, setShowMappingModal] = useState<boolean>(false);

  // Column Mapping State
  const [priceCol, setPriceCol] = useState<string>('');
  const [areaCol, setAreaCol] = useState<string>('');
  const [locationCol, setLocationCol] = useState<string>('');
  const [propTypeCol, setPropTypeCol] = useState<string>('');
  const [bhkCol, setBhkCol] = useState<string>('');
  const [dateCol, setDateCol] = useState<string>('');

  // Horizontal Filter Bar State
  const [filterLocation, setFilterLocation] = useState<string>('All');
  const [filterPropType, setFilterPropType] = useState<string>('All');
  const [filterBhk, setFilterBhk] = useState<string>('All');
  const [filterDateMonth, setFilterDateMonth] = useState<string>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [topNLocations, setTopNLocations] = useState<5 | 10 | 15>(10);

  // Property Explorer State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'location' | 'type' | 'bhk' | 'area' | 'price' | 'pps'>('price');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Load CSV text
  const loadCSVDataset = (name: string, csvContent: string, autoOpenDashboard = false) => {
    setUploadError('');
    try {
      const parsed = parseCSVText(csvContent);
      if (parsed.headers.length === 0 || parsed.rows.length === 0) {
        setUploadError('The uploaded CSV file contains no valid data rows.');
        return;
      }

      setFileName(name);
      setHeaders(parsed.headers);
      setRawRows(parsed.rows);

      const detPrice = detectColumn(parsed.headers, PRICE_CANDIDATES);
      const detArea = detectColumn(parsed.headers, AREA_CANDIDATES);
      const detLoc = detectColumn(parsed.headers, LOCATION_CANDIDATES);
      const detType = detectColumn(parsed.headers, TYPE_CANDIDATES);
      const detBhk = detectColumn(parsed.headers, BHK_CANDIDATES);
      const detDate = detectColumn(parsed.headers, DATE_CANDIDATES);

      setPriceCol(detPrice);
      setAreaCol(detArea);
      setLocationCol(detLoc);
      setPropTypeCol(detType);
      setBhkCol(detBhk);
      setDateCol(detDate);

      // Reset filters
      setFilterLocation('All');
      setFilterPropType('All');
      setFilterBhk('All');
      setFilterDateMonth('All');
      setMaxPriceFilter(null);
      setSearchQuery('');

      if (autoOpenDashboard) {
        setIsDashboardReady(true);
      }
    } catch {
      setUploadError('Could not read the CSV file. Please verify the file format.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please select a valid .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      loadCSVDataset(file.name, ev.target?.result as string, false);
    };
    reader.readAsText(file);
  };

  // Clean Dataset & Compute Quality Summary
  const { cleanedRows, qualitySummary } = useMemo<{
    cleanedRows: CleanedRow[];
    qualitySummary: QualitySummary;
  }>(() => {
    if (rawRows.length === 0) {
      return {
        cleanedRows: [],
        qualitySummary: { totalRows: 0, cleanedRows: 0, totalCols: 0, missingValues: 0, duplicateRows: 0 }
      };
    }

    let missingValues = 0;
    let duplicateRows = 0;
    const seen = new Set<string>();
    const deduped: RawRow[] = [];

    for (const r of rawRows) {
      for (const h of headers) {
        const v = r[h];
        if (!v || v.trim() === '' || v.trim().toLowerCase() === 'nan' || v.trim().toLowerCase() === 'null') {
          missingValues++;
        }
      }
      const key = headers.map((h) => (r[h] ?? '').trim()).join('||');
      if (seen.has(key)) {
        duplicateRows++;
      } else {
        seen.add(key);
        deduped.push(r);
      }
    }

    const cleaned: CleanedRow[] = [];
    for (const r of deduped) {
      const pVal = priceCol ? parseNumericValue(r[priceCol]) : null;
      const aVal = areaCol ? parseNumericValue(r[areaCol]) : null;
      const bVal = bhkCol ? parseNumericValue(r[bhkCol]) : null;
      const locVal = locationCol ? (r[locationCol]?.trim() || 'Unspecified') : null;
      const typeVal = propTypeCol ? (r[propTypeCol]?.trim() || 'Unspecified') : null;
      const dateInfo = dateCol ? parseDateMonth(r[dateCol]) : { monthKey: null, dateObj: null };

      if (priceCol && (pVal === null || pVal <= 0)) continue;
      if (areaCol && (aVal === null || aVal <= 0)) continue;

      const pps = pVal !== null && aVal !== null && aVal > 0 ? pVal / aVal : null;

      cleaned.push({
        original: r,
        _price: pVal,
        _area: aVal,
        _bhk: bVal !== null ? Math.round(bVal) : null,
        _location: locVal,
        _property_type: typeVal,
        _price_per_sqft: pps,
        _date: dateInfo.monthKey,
        _rawDate: dateInfo.dateObj
      });
    }

    return {
      cleanedRows: cleaned,
      qualitySummary: {
        totalRows: rawRows.length,
        cleanedRows: cleaned.length,
        totalCols: headers.length,
        missingValues,
        duplicateRows
      }
    };
  }, [rawRows, headers, priceCol, areaCol, locationCol, propTypeCol, bhkCol, dateCol]);

  // Extract Available Filter Values
  const filterMeta = useMemo(() => {
    const locs = new Set<string>();
    const types = new Set<string>();
    const bhks = new Set<number>();
    const months = new Set<string>();
    let minP = Infinity;
    let maxP = -Infinity;

    for (const r of cleanedRows) {
      if (r._location) locs.add(r._location);
      if (r._property_type) types.add(r._property_type);
      if (r._bhk !== null) bhks.add(r._bhk);
      if (r._date) months.add(r._date);
      if (r._price !== null) {
        if (r._price < minP) minP = r._price;
        if (r._price > maxP) maxP = r._price;
      }
    }

    return {
      locations: Array.from(locs).sort(),
      propertyTypes: Array.from(types).sort(),
      bhks: Array.from(bhks).sort((a, b) => a - b),
      months: Array.from(months).sort(),
      minPrice: minP === Infinity ? 0 : minP,
      maxPrice: maxP === -Infinity ? 0 : maxP
    };
  }, [cleanedRows]);

  // Filtered Dataset
  const filteredRows = useMemo(() => {
    return cleanedRows.filter((r) => {
      if (filterLocation !== 'All' && r._location !== filterLocation) return false;
      if (filterPropType !== 'All' && r._property_type !== filterPropType) return false;
      if (filterBhk !== 'All' && String(r._bhk) !== filterBhk) return false;
      if (filterDateMonth !== 'All' && r._date !== filterDateMonth) return false;
      if (maxPriceFilter !== null && r._price !== null && r._price > maxPriceFilter) return false;
      return true;
    });
  }, [cleanedRows, filterLocation, filterPropType, filterBhk, filterDateMonth, maxPriceFilter]);

  const handleResetFilters = () => {
    setFilterLocation('All');
    setFilterPropType('All');
    setFilterBhk('All');
    setFilterDateMonth('All');
    setMaxPriceFilter(null);
    setSearchQuery('');
  };

  // KPIs
  const kpiStats = useMemo(() => {
    const totalProps = filteredRows.length;
    const prices = filteredRows.map((r) => r._price).filter((v): v is number => v !== null);
    const ppsVals = filteredRows.map((r) => r._price_per_sqft).filter((v): v is number => v !== null);
    const areas = filteredRows.map((r) => r._area).filter((v): v is number => v !== null);
    const uniqueLocs = new Set(filteredRows.map((r) => r._location).filter(Boolean)).size;

    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;
    const medianPrice = prices.length > 0 ? computeMedian(prices) : null;
    const avgPps = ppsVals.length > 0 ? ppsVals.reduce((a, b) => a + b, 0) / ppsVals.length : null;
    const avgArea = areas.length > 0 ? areas.reduce((a, b) => a + b, 0) / areas.length : null;

    return { totalProps, avgPrice, medianPrice, avgPps, avgArea, uniqueLocs };
  }, [filteredRows]);

  // Price Trend (by Date Month) OR Price Distribution (if no date column)
  const priceTrendOrDist = useMemo(() => {
    const dated = filteredRows.filter((r) => r._date !== null && r._price !== null);
    if (dated.length >= 3) {
      const monthMap = new Map<string, { sum: number; count: number }>();
      for (const r of dated) {
        const cur = monthMap.get(r._date!) || { sum: 0, count: 0 };
        cur.sum += r._price!;
        cur.count += 1;
        monthMap.set(r._date!, cur);
      }
      const series = Array.from(monthMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, d]) => ({
          label: month,
          value: d.sum / d.count,
          count: d.count
        }));

      let growthPct: number | null = null;
      if (series.length >= 2 && series[0].value > 0) {
        growthPct = ((series[series.length - 1].value - series[0].value) / series[0].value) * 100;
      }

      return { mode: 'trend' as const, series, growthPct };
    }

    // Fallback: Price Bracket Distribution
    const prices = filteredRows.map((r) => r._price).filter((v): v is number => v !== null);
    if (prices.length === 0) return { mode: 'dist' as const, series: [], growthPct: null };
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const binsCount = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(prices.length))));
    const step = maxP > minP ? (maxP - minP) / binsCount : 1;
    const bins = Array.from({ length: binsCount }, (_, i) => {
      const bMin = minP + i * step;
      const bMax = i === binsCount - 1 ? maxP : minP + (i + 1) * step;
      return {
        label: formatINR((bMin + bMax) / 2),
        value: 0,
        count: 0
      };
    });
    for (const p of prices) {
      let idx = step > 0 ? Math.floor((p - minP) / step) : 0;
      if (idx >= binsCount) idx = binsCount - 1;
      if (idx < 0) idx = 0;
      bins[idx].value += 1;
      bins[idx].count += 1;
    }
    return { mode: 'dist' as const, series: bins, growthPct: null };
  }, [filteredRows]);

  // Property Type Distribution (Donut / Bar)
  const propertyTypeDist = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of filteredRows) {
      if (r._property_type) {
        counts.set(r._property_type, (counts.get(r._property_type) || 0) + 1);
      }
    }
    const total = filteredRows.length || 1;
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], idx) => ({
        name,
        count,
        pct: (count / total) * 100,
        color: BLUE_SHADES[idx % BLUE_SHADES.length]
      }));
  }, [filteredRows]);

  // Location Analysis Aggregations
  const locationAnalysis = useMemo(() => {
    const map = new Map<string, { sumPrice: number; pCount: number; sumPps: number; ppsCount: number; count: number }>();
    for (const r of filteredRows) {
      if (!r._location) continue;
      const cur = map.get(r._location) || { sumPrice: 0, pCount: 0, sumPps: 0, ppsCount: 0, count: 0 };
      cur.count += 1;
      if (r._price !== null) {
        cur.sumPrice += r._price;
        cur.pCount += 1;
      }
      if (r._price_per_sqft !== null) {
        cur.sumPps += r._price_per_sqft;
        cur.ppsCount += 1;
      }
      map.set(r._location, cur);
    }

    const all = Array.from(map.entries()).map(([location, d]) => ({
      location,
      avgPrice: d.pCount > 0 ? d.sumPrice / d.pCount : 0,
      avgPps: d.ppsCount > 0 ? d.sumPps / d.ppsCount : 0,
      count: d.count
    }));

    return {
      byPrice: [...all].sort((a, b) => b.avgPrice - a.avgPrice).slice(0, topNLocations),
      byPps: [...all].sort((a, b) => b.avgPps - a.avgPps).slice(0, topNLocations),
      byCount: [...all].sort((a, b) => b.count - a.count).slice(0, topNLocations)
    };
  }, [filteredRows, topNLocations]);

  // Scatter Plot (Price vs Area) & BHK Analysis
  const priceAndBhkAnalysis = useMemo(() => {
    const scatter = filteredRows
      .filter((r) => r._area !== null && r._price !== null)
      .slice(0, 300)
      .map((r) => ({
        area: r._area!,
        price: r._price!,
        location: r._location || '',
        bhk: r._bhk,
        type: r._property_type || ''
      }));

    const regression = computeLinearRegression(
      scatter.map((s) => s.area),
      scatter.map((s) => s.price)
    );

    const bhkMap = new Map<number, { count: number; sumPrice: number }>();
    for (const r of filteredRows) {
      if (r._bhk !== null) {
        const cur = bhkMap.get(r._bhk) || { count: 0, sumPrice: 0 };
        cur.count += 1;
        if (r._price !== null) cur.sumPrice += r._price;
        bhkMap.set(r._bhk, cur);
      }
    }

    const bhkSeries = Array.from(bhkMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([bhk, d]) => ({
        label: `${bhk} BHK`,
        count: d.count,
        avgPrice: d.count > 0 ? d.sumPrice / d.count : 0
      }));

    return { scatter, regression, bhkSeries };
  }, [filteredRows]);

  // Rule-Based Business Insights
  const marketInsights = useMemo(() => {
    const items: { text: React.ReactNode }[] = [];
    if (filteredRows.length === 0) return items;

    if (locationCol && priceCol && areaCol && locationAnalysis.byPps.length > 0) {
      const top = locationAnalysis.byPps[0];
      items.push({
        text: (
          <span>
            <strong className="font-semibold text-[#1F2937]">{top.location}</strong> has the highest average price per sq ft at{' '}
            <span className="font-semibold text-[#16A34A]">
              ₹{Math.round(top.avgPps).toLocaleString('en-IN')} / sqft
            </span>
            .
          </span>
        )
      });
    }

    if (locationCol && priceCol && locationAnalysis.byPrice.length > 0) {
      const topP = locationAnalysis.byPrice[0];
      items.push({
        text: (
          <span>
            <strong className="font-semibold text-[#1F2937]">{topP.location}</strong> leads overall property valuation with an average price of{' '}
            <strong className="font-semibold text-[#1F2937]">{formatINR(topP.avgPrice)}</strong>.
          </span>
        )
      });
    }

    if (bhkCol && priceAndBhkAnalysis.bhkSeries.length > 0) {
      const topBhk = [...priceAndBhkAnalysis.bhkSeries].sort((a, b) => b.count - a.count)[0];
      const share = ((topBhk.count / filteredRows.length) * 100).toFixed(1);
      items.push({
        text: (
          <span>
            <strong className="font-semibold text-[#1F2937]">{topBhk.label}</strong> properties represent the largest share of listings (
            <span className="font-semibold text-[#16A34A]">{share}% High Demand Indicator</span>, {topBhk.count} units).
          </span>
        )
      });
    }

    if (priceAndBhkAnalysis.regression !== null) {
      const r = priceAndBhkAnalysis.regression.r;
      const isPos = r > 0.2;
      items.push({
        text: (
          <span>
            Larger properties show{' '}
            <span className={isPos ? 'font-semibold text-[#16A34A]' : 'font-semibold text-[#1F2937]'}>
              {isPos ? 'a positive relationship (↑ Positive Trend)' : 'a moderate relationship'}
            </span>{' '}
            with total price (correlation r = {r.toFixed(2)}).
          </span>
        )
      });
    }

    if (propTypeCol && propertyTypeDist.length > 0) {
      const topType = propertyTypeDist[0];
      items.push({
        text: (
          <span>
            <strong className="font-semibold text-[#1F2937]">{topType.name}</strong> is the primary property segment, accounting for{' '}
            <strong className="font-semibold text-[#1F2937]">{topType.pct.toFixed(1)}%</strong> of analyzed inventory.
          </span>
        )
      });
    }

    return items;
  }, [filteredRows, locationCol, priceCol, areaCol, bhkCol, propTypeCol, locationAnalysis, priceAndBhkAnalysis, propertyTypeDist]);

  // Property Explorer Sorted & Searched Table
  const explorerTableRows = useMemo(() => {
    let rows = [...filteredRows];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r._location && r._location.toLowerCase().includes(q)) ||
          (r._property_type && r._property_type.toLowerCase().includes(q)) ||
          headers.some((h) => String(r.original[h] ?? '').toLowerCase().includes(q))
      );
    }

    rows.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'location') {
        cmp = (a._location || '').localeCompare(b._location || '');
      } else if (sortField === 'type') {
        cmp = (a._property_type || '').localeCompare(b._property_type || '');
      } else if (sortField === 'bhk') {
        cmp = (a._bhk ?? 0) - (b._bhk ?? 0);
      } else if (sortField === 'area') {
        cmp = (a._area ?? 0) - (b._area ?? 0);
      } else if (sortField === 'price') {
        cmp = (a._price ?? 0) - (b._price ?? 0);
      } else if (sortField === 'pps') {
        cmp = (a._price_per_sqft ?? 0) - (b._price_per_sqft ?? 0);
      }
      return sortAsc ? cmp : -cmp;
    });

    return rows;
  }, [filteredRows, searchQuery, sortField, sortAsc, headers]);

  // Export CSV
  const handleExportCSV = () => {
    if (explorerTableRows.length === 0) return;
    const escapeCSV = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const cols = ['Location', 'Property Type', 'BHK', 'Area (Sq Ft)', 'Price', 'Price / Sq Ft'];
    const lines = [
      cols.join(','),
      ...explorerTableRows.map((r) =>
        [
          escapeCSV(r._location || '—'),
          escapeCSV(r._property_type || '—'),
          r._bhk !== null ? String(r._bhk) : '',
          r._area !== null ? String(Math.round(r._area)) : '',
          r._price !== null ? String(Math.round(r._price)) : '',
          r._price_per_sqft !== null ? String(Math.round(r._price_per_sqft)) : ''
        ].join(',')
      )
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered_${fileName || 'real_estate_analysis.csv'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (field: 'location' | 'type' | 'bhk' | 'area' | 'price' | 'pps') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const navItems: { label: NavSection; icon: React.ComponentType<{ className?: string }> }[] = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Market Analysis', icon: TrendingUp },
    { label: 'Location Analysis', icon: MapPin },
    { label: 'Price Analysis', icon: BarChart3 },
    { label: 'Property Explorer', icon: TableIcon },
    { label: 'Data Quality', icon: ShieldCheck }
  ];

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1F2937] flex">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* LEFT SIDEBAR (245px fixed width on desktop) */}
      <aside className="w-[245px] shrink-0 bg-[#FFFFFF] border-r border-[#E5E7EB] flex flex-col justify-between select-none">
        <div>
          {/* Top Brand Header */}
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#2563EB] text-white flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[12px] font-bold tracking-wider text-[#1F2937]">
                REAL ESTATE
              </div>
              <div className="text-[11px] font-semibold tracking-wider text-[#2563EB]">
                ANALYTICS
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="py-3 px-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveNav(item.label)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium rounded-r transition-colors ${
                    isSelected
                      ? 'bg-[#EFF6FF] text-[#2563EB] border-l-[3px] border-[#2563EB] font-semibold'
                      : 'text-[#6B7280] hover:bg-gray-50 hover:text-[#1F2937] border-l-[3px] border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#2563EB]' : 'text-[#6B7280]'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Dataset Actions */}
        <div className="p-3.5 border-t border-[#E5E7EB] space-y-2 bg-[#F9FAFB]">
          <div className="text-[11.5px] text-[#6B7280] truncate">
            Active File:{' '}
            <span className="font-semibold text-[#1F2937]">
              {fileName || 'No file uploaded'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1.5 px-3 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-[12.5px] font-medium rounded flex items-center justify-center gap-1.5 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV File</span>
          </button>
          {rawRows.length > 0 && (
            <button
              type="button"
              onClick={() => setShowMappingModal(!showMappingModal)}
              className="w-full py-1.5 px-3 bg-[#FFFFFF] hover:bg-gray-50 text-[#1F2937] border border-[#E5E7EB] text-[12px] font-medium rounded flex items-center justify-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#6B7280]" />
              <span>Column Mapping</span>
            </button>
          )}
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
        {/* TOP HEADER */}
        <header className="px-6 py-3.5 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#FFFFFF]">
          <div>
            <h1 className="text-[22px] font-semibold text-[#1F2937] leading-tight">
              Real Estate Market Dashboard
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              Market overview and property insights
            </p>
          </div>

          <div className="flex items-center gap-4 text-[12.5px] text-[#6B7280]">
            <div className="text-right">
              <div>
                Dataset:{' '}
                <strong className="font-semibold text-[#1F2937]">
                  {fileName || 'Awaiting CSV upload'}
                </strong>
              </div>
              <div className="text-[11.5px] text-[#6B7280]">
                Last Updated: <span className="text-[#1F2937] font-medium">Current session</span>
              </div>
            </div>
          </div>
        </header>

        {/* STEP 1: CSV UPLOAD & INSPECTION SCREEN (WHEN NO DATASET ANALYZED YET) */}
        {!isDashboardReady ? (
          <main className="p-6 max-w-4xl space-y-5">
            <div className="border border-[#E5E7EB] rounded-[6px] p-6 bg-[#FFFFFF]">
              <h2 className="text-[17px] font-semibold text-[#1F2937]">
                Real Estate Market Analysis
              </h2>
              <p className="text-[13.5px] text-[#6B7280] mt-0.5">
                Turn property data into clear market insights.
              </p>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;
                  if (!file.name.toLowerCase().endsWith('.csv')) {
                    setUploadError('Please upload a valid .csv dataset.');
                    return;
                  }
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    loadCSVDataset(file.name, ev.target?.result as string, false);
                  };
                  reader.readAsText(file);
                }}
                className="mt-5 border-2 border-dashed border-[#E5E7EB] hover:border-[#2563EB] rounded-[6px] p-8 text-center cursor-pointer transition-colors bg-[#F9FAFB]"
              >
                <div className="w-10 h-10 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-[14px] font-semibold text-[#1F2937]">
                  Upload your real estate CSV dataset to generate an interactive market analysis dashboard.
                </div>
                <div className="text-[12.5px] text-[#6B7280] mt-1">
                  Accepts standard .csv files containing property listings, prices, area (sq ft), locations, and BHK.
                </div>

                <div
                  className="mt-4 flex items-center justify-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-[13px] font-medium rounded transition-colors"
                  >
                    Browse CSV File
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      loadCSVDataset('sample_real_estate_data.csv', SAMPLE_REAL_ESTATE_CSV, false)
                    }
                    className="px-4 py-2 bg-[#FFFFFF] hover:bg-gray-50 text-[#1F2937] border border-[#E5E7EB] text-[13px] font-medium rounded transition-colors"
                  >
                    Load Sample Dataset (.CSV)
                  </button>
                </div>
              </div>

              {uploadError && (
                <div className="mt-4 p-3 border border-red-200 bg-red-50 rounded text-[13px] text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Loaded CSV Summary & Analyze Button */}
              {rawRows.length > 0 && (
                <div className="mt-6 space-y-5 pt-5 border-t border-[#E5E7EB]">
                  <div className="flex items-center justify-between bg-[#DCFCE7] border border-[#16A34A]/30 px-4 py-2.5 rounded">
                    <span className="text-[13px] font-medium text-[#16A34A]">
                      ✓ Dataset <strong>{fileName}</strong> successfully loaded.
                    </span>
                    <span className="text-[12px] font-semibold text-[#16A34A] tabular-nums">
                      {rawRows.length.toLocaleString('en-IN')} rows × {headers.length} columns
                    </span>
                  </div>

                  {/* File Summary Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border border-[#E5E7EB] rounded p-3.5 bg-[#FFFFFF]">
                      <div className="text-[12px] text-[#6B7280]">File Name</div>
                      <div className="text-[15px] font-semibold text-[#1F2937] mt-1 truncate">
                        {fileName}
                      </div>
                    </div>
                    <div className="border border-[#E5E7EB] rounded p-3.5 bg-[#FFFFFF]">
                      <div className="text-[12px] text-[#6B7280]">Number of Rows</div>
                      <div className="text-[18px] font-semibold text-[#1F2937] mt-1 tabular-nums">
                        {rawRows.length.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="border border-[#E5E7EB] rounded p-3.5 bg-[#FFFFFF]">
                      <div className="text-[12px] text-[#6B7280]">Number of Columns</div>
                      <div className="text-[18px] font-semibold text-[#1F2937] mt-1 tabular-nums">
                        {headers.length}
                      </div>
                    </div>
                  </div>

                  {/* Column Detection Dropdowns */}
                  <div className="border border-[#E5E7EB] rounded p-4 bg-[#F9FAFB] space-y-3">
                    <div className="text-[13px] font-semibold text-[#1F2937]">
                      Detected Columns (Adjust if needed)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-[11.5px] text-[#6B7280] mb-1">Price</label>
                        <select
                          value={priceCol}
                          onChange={(e) => setPriceCol(e.target.value)}
                          className="w-full text-[12.5px] border border-[#E5E7EB] rounded px-2 py-1.5 bg-white text-[#1F2937]"
                        >
                          <option value="">(None)</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11.5px] text-[#6B7280] mb-1">Area (Sq Ft)</label>
                        <select
                          value={areaCol}
                          onChange={(e) => setAreaCol(e.target.value)}
                          className="w-full text-[12.5px] border border-[#E5E7EB] rounded px-2 py-1.5 bg-white text-[#1F2937]"
                        >
                          <option value="">(None)</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11.5px] text-[#6B7280] mb-1">Location</label>
                        <select
                          value={locationCol}
                          onChange={(e) => setLocationCol(e.target.value)}
                          className="w-full text-[12.5px] border border-[#E5E7EB] rounded px-2 py-1.5 bg-white text-[#1F2937]"
                        >
                          <option value="">(None)</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11.5px] text-[#6B7280] mb-1">Property Type</label>
                        <select
                          value={propTypeCol}
                          onChange={(e) => setPropTypeCol(e.target.value)}
                          className="w-full text-[12.5px] border border-[#E5E7EB] rounded px-2 py-1.5 bg-white text-[#1F2937]"
                        >
                          <option value="">(None)</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11.5px] text-[#6B7280] mb-1">BHK</label>
                        <select
                          value={bhkCol}
                          onChange={(e) => setBhkCol(e.target.value)}
                          className="w-full text-[12.5px] border border-[#E5E7EB] rounded px-2 py-1.5 bg-white text-[#1F2937]"
                        >
                          <option value="">(None)</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11.5px] text-[#6B7280] mb-1">Date (Optional)</label>
                        <select
                          value={dateCol}
                          onChange={(e) => setDateCol(e.target.value)}
                          className="w-full text-[12.5px] border border-[#E5E7EB] rounded px-2 py-1.5 bg-white text-[#1F2937]"
                        >
                          <option value="">(None)</option>
                          {headers.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDashboardReady(true)}
                      className="px-5 py-2 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-[13.5px] font-semibold rounded transition-colors"
                    >
                      Analyze Dataset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        ) : (
          /* STEP 2: MAIN CORPORATE BI DASHBOARD */
          <main className="p-6 space-y-5">
            {/* OPTIONAL COLUMN MAPPING BAR */}
            {showMappingModal && (
              <div className="border border-[#E5E7EB] rounded-[6px] p-4 bg-[#F9FAFB] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#1F2937]">
                    Dataset Column Mapping
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMappingModal(false)}
                    className="text-[12px] text-[#2563EB] font-medium hover:underline"
                  >
                    Done
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-[11.5px] text-[#6B7280] mb-1">Price</label>
                    <select
                      value={priceCol}
                      onChange={(e) => setPriceCol(e.target.value)}
                      className="w-full text-[12px] border border-[#E5E7EB] rounded px-2 py-1 bg-white"
                    >
                      <option value="">(None)</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11.5px] text-[#6B7280] mb-1">Area</label>
                    <select
                      value={areaCol}
                      onChange={(e) => setAreaCol(e.target.value)}
                      className="w-full text-[12px] border border-[#E5E7EB] rounded px-2 py-1 bg-white"
                    >
                      <option value="">(None)</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11.5px] text-[#6B7280] mb-1">Location</label>
                    <select
                      value={locationCol}
                      onChange={(e) => setLocationCol(e.target.value)}
                      className="w-full text-[12px] border border-[#E5E7EB] rounded px-2 py-1 bg-white"
                    >
                      <option value="">(None)</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11.5px] text-[#6B7280] mb-1">Property Type</label>
                    <select
                      value={propTypeCol}
                      onChange={(e) => setPropTypeCol(e.target.value)}
                      className="w-full text-[12px] border border-[#E5E7EB] rounded px-2 py-1 bg-white"
                    >
                      <option value="">(None)</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11.5px] text-[#6B7280] mb-1">BHK</label>
                    <select
                      value={bhkCol}
                      onChange={(e) => setBhkCol(e.target.value)}
                      className="w-full text-[12px] border border-[#E5E7EB] rounded px-2 py-1 bg-white"
                    >
                      <option value="">(None)</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11.5px] text-[#6B7280] mb-1">Date</label>
                    <select
                      value={dateCol}
                      onChange={(e) => setDateCol(e.target.value)}
                      className="w-full text-[12px] border border-[#E5E7EB] rounded px-2 py-1 bg-white"
                    >
                      <option value="">(None)</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* COMPACT HORIZONTAL FILTER BAR */}
            <div className="border border-[#E5E7EB] rounded-[6px] px-4 py-3 bg-[#FFFFFF] flex flex-wrap items-center gap-4">
              {locationCol && filterMeta.locations.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-[12.5px] font-medium text-[#6B7280]">Location</label>
                  <select
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="text-[12.5px] border border-[#E5E7EB] rounded px-2.5 py-1 bg-[#FFFFFF] text-[#1F2937] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="All">All</option>
                    {filterMeta.locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              )}

              {propTypeCol && filterMeta.propertyTypes.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-[12.5px] font-medium text-[#6B7280]">Property Type</label>
                  <select
                    value={filterPropType}
                    onChange={(e) => setFilterPropType(e.target.value)}
                    className="text-[12.5px] border border-[#E5E7EB] rounded px-2.5 py-1 bg-[#FFFFFF] text-[#1F2937] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="All">All</option>
                    {filterMeta.propertyTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              )}

              {bhkCol && filterMeta.bhks.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-[12.5px] font-medium text-[#6B7280]">BHK</label>
                  <select
                    value={filterBhk}
                    onChange={(e) => setFilterBhk(e.target.value)}
                    className="text-[12.5px] border border-[#E5E7EB] rounded px-2.5 py-1 bg-[#FFFFFF] text-[#1F2937] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="All">All</option>
                    {filterMeta.bhks.map((b) => (
                      <option key={b} value={String(b)}>{b} BHK</option>
                    ))}
                  </select>
                </div>
              )}

              {priceCol && filterMeta.maxPrice > filterMeta.minPrice && (
                <div className="flex items-center gap-2">
                  <label className="text-[12.5px] font-medium text-[#6B7280]">Max Price</label>
                  <input
                    type="range"
                    min={filterMeta.minPrice}
                    max={filterMeta.maxPrice}
                    value={maxPriceFilter ?? filterMeta.maxPrice}
                    onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                    className="w-28 accent-[#2563EB] cursor-pointer"
                  />
                  <span className="text-[12px] text-[#1F2937] font-medium tabular-nums">
                    {formatINR(maxPriceFilter ?? filterMeta.maxPrice)}
                  </span>
                </div>
              )}

              {dateCol && filterMeta.months.length > 0 && (
                <div className="flex items-center gap-2">
                  <label className="text-[12.5px] font-medium text-[#6B7280]">Date</label>
                  <select
                    value={filterDateMonth}
                    onChange={(e) => setFilterDateMonth(e.target.value)}
                    className="text-[12.5px] border border-[#E5E7EB] rounded px-2.5 py-1 bg-[#FFFFFF] text-[#1F2937] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="All">All</option>
                    {filterMeta.months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto px-3 py-1 text-[12px] font-medium text-[#1F2937] bg-[#FFFFFF] hover:bg-gray-50 border border-[#E5E7EB] rounded flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3 text-[#6B7280]" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* ROW 1: 4 HORIZONTAL KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* KPI 1: Total Properties */}
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[6px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#6B7280]">Total Properties</span>
                  <div className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <Home className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-[26px] font-semibold text-[#1F2937] mt-1.5 tabular-nums leading-tight">
                  {kpiStats.totalProps.toLocaleString('en-IN')}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="inline-block px-1.5 py-0.5 text-[11.5px] font-semibold text-[#16A34A] bg-[#DCFCE7] rounded">
                    ↑ {cleanedRows.length > 0 ? ((kpiStats.totalProps / cleanedRows.length) * 100).toFixed(1) : '100'}%
                  </span>
                  <span className="text-[12px] text-[#6B7280]">active listings</span>
                </div>
              </div>

              {/* KPI 2: Average Property Price */}
              {priceCol && kpiStats.avgPrice !== null && (
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[6px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#6B7280]">Average Property Price</span>
                    <div className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-[26px] font-semibold text-[#1F2937] mt-1.5 tabular-nums leading-tight">
                    {formatINR(kpiStats.avgPrice)}
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {priceTrendOrDist.growthPct !== null && priceTrendOrDist.growthPct > 0 ? (
                      <span className="inline-block px-1.5 py-0.5 text-[11.5px] font-semibold text-[#16A34A] bg-[#DCFCE7] rounded">
                        ↑ {priceTrendOrDist.growthPct.toFixed(1)}%
                      </span>
                    ) : null}
                    <span className="text-[12px] text-[#6B7280]">
                      Median: {formatINR(kpiStats.medianPrice)}
                    </span>
                  </div>
                </div>
              )}

              {/* KPI 3: Average Price / Sq Ft */}
              {priceCol && areaCol && kpiStats.avgPps !== null && (
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[6px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#6B7280]">Average Price / Sq Ft</span>
                    <div className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-[26px] font-semibold text-[#1F2937] mt-1.5 tabular-nums leading-tight">
                    ₹{Math.round(kpiStats.avgPps).toLocaleString('en-IN')}
                  </div>
                  <div className="mt-2 text-[12px] text-[#6B7280]">
                    Avg Area: {kpiStats.avgArea ? `${Math.round(kpiStats.avgArea).toLocaleString('en-IN')} sqft` : '—'}
                  </div>
                </div>
              )}

              {/* KPI 4: Total Locations / Median Price */}
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[6px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#6B7280]">
                    {locationCol ? 'Total Locations' : 'Median Property Price'}
                  </span>
                  <div className="w-6 h-6 rounded bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-[26px] font-semibold text-[#1F2937] mt-1.5 tabular-nums leading-tight">
                  {locationCol
                    ? kpiStats.uniqueLocs.toLocaleString('en-IN')
                    : formatINR(kpiStats.medianPrice)}
                </div>
                <div className="mt-2 text-[12px] text-[#6B7280]">
                  {locationCol ? 'Distinct localities in view' : '50th percentile valuation'}
                </div>
              </div>
            </div>

            {/* DATA QUALITY SECTION (WHEN DATA QUALITY TAB SELECTED) */}
            {activeNav === 'Data Quality' && (
              <div className="border border-[#E5E7EB] rounded-[6px] p-5 bg-[#FFFFFF] space-y-4">
                <div className="border-b border-[#E5E7EB] pb-2.5 flex items-center justify-between">
                  <h2 className="text-[16px] font-semibold text-[#1F2937]">
                    Data Quality & Cleaning Summary
                  </h2>
                  <span className="text-[12px] text-[#6B7280]">
                    Source: {fileName}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border border-[#E5E7EB] rounded p-3.5">
                    <div className="text-[12px] text-[#6B7280]">Total Raw Rows</div>
                    <div className="text-[22px] font-semibold text-[#1F2937] mt-1 tabular-nums">
                      {qualitySummary.totalRows.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="border border-[#E5E7EB] rounded p-3.5">
                    <div className="text-[12px] text-[#6B7280]">Total Columns</div>
                    <div className="text-[22px] font-semibold text-[#1F2937] mt-1 tabular-nums">
                      {qualitySummary.totalCols}
                    </div>
                  </div>
                  <div className="border border-[#E5E7EB] rounded p-3.5">
                    <div className="text-[12px] text-[#6B7280]">Missing Values Handled</div>
                    <div className="text-[22px] font-semibold text-[#1F2937] mt-1 tabular-nums">
                      {qualitySummary.missingValues}
                    </div>
                  </div>
                  <div className="border border-[#E5E7EB] rounded p-3.5">
                    <div className="text-[12px] text-[#6B7280]">Duplicate Rows Removed</div>
                    <div className="text-[22px] font-semibold text-[#1F2937] mt-1 tabular-nums">
                      {qualitySummary.duplicateRows}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ROW 2: PRICE TREND (LINE CHART) + PROPERTY TYPES (DONUT CHART) */}
            {(activeNav === 'Dashboard' || activeNav === 'Market Analysis') && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Price Trend Line Chart (or Price Distribution Bar Chart if no Date column) */}
                <div className="lg:col-span-7 border border-[#E5E7EB] rounded-[6px] p-4 bg-[#FFFFFF]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-[16px] font-semibold text-[#1F2937]">
                        {priceTrendOrDist.mode === 'trend'
                          ? 'Property Price Trend'
                          : 'Property Price Distribution'}
                      </h2>
                      <p className="text-[12px] text-[#6B7280]">
                        {priceTrendOrDist.mode === 'trend'
                          ? 'Average property valuation over time'
                          : 'Number of properties across price brackets'}
                      </p>
                    </div>
                    {priceTrendOrDist.growthPct !== null && priceTrendOrDist.growthPct > 0 && (
                      <span className="px-2 py-0.5 text-[12px] font-semibold text-[#16A34A] bg-[#DCFCE7] rounded tabular-nums">
                        ↑ +{priceTrendOrDist.growthPct.toFixed(1)}% Price Growth
                      </span>
                    )}
                  </div>

                  {priceTrendOrDist.series.length > 0 ? (
                    priceTrendOrDist.mode === 'trend' ? (
                      (() => {
                        const pts = priceTrendOrDist.series;
                        const vals = pts.map((p) => p.value);
                        const minV = Math.min(...vals) * 0.9;
                        const maxV = Math.max(...vals) * 1.05;
                        const spanV = maxV - minV || 1;
                        const w = 560;
                        const h = 210;
                        const padL = 55;
                        const padR = 20;
                        const padT = 18;
                        const padB = 30;
                        const plotW = w - padL - padR;
                        const plotH = h - padT - padB;

                        const coords = pts.map((pt, i) => {
                          const x =
                            padL + (pts.length > 1 ? (i / (pts.length - 1)) * plotW : plotW / 2);
                          const y = padT + plotH - ((pt.value - minV) / spanV) * plotH;
                          return { x, y, ...pt };
                        });

                        const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
                        const areaPoints = `${coords[0].x},${padT + plotH} ${polylinePoints} ${
                          coords[coords.length - 1].x
                        },${padT + plotH}`;

                        return (
                          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56 overflow-visible">
                            {/* Horizontal grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((g) => {
                              const y = padT + g * plotH;
                              const labelVal = maxV - g * spanV;
                              return (
                                <g key={g}>
                                  <line
                                    x1={padL}
                                    x2={w - padR}
                                    y1={y}
                                    y2={y}
                                    stroke="#E5E7EB"
                                    strokeWidth="1"
                                  />
                                  <text
                                    x={padL - 6}
                                    y={y + 3}
                                    textAnchor="end"
                                    fontSize="10"
                                    fill="#6B7280"
                                  >
                                    {formatINR(labelVal)}
                                  </text>
                                </g>
                              );
                            })}
                            {/* Light Blue Area Fill */}
                            <polygon points={areaPoints} fill="#EFF6FF" />
                            {/* Primary Blue Line */}
                            <polyline
                              fill="none"
                              stroke="#2563EB"
                              strokeWidth="2.2"
                              points={polylinePoints}
                            />
                            {/* Data Points & Labels */}
                            {coords.map((c, idx) => (
                              <g key={idx}>
                                <circle
                                  cx={c.x}
                                  cy={c.y}
                                  r="3.5"
                                  fill="#2563EB"
                                  stroke="#FFFFFF"
                                  strokeWidth="1.5"
                                >
                                  <title>{`${c.label}: ${formatINR(c.value)} (${c.count} listings)`}</title>
                                </circle>
                                <text
                                  x={c.x}
                                  y={h - 8}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fill="#6B7280"
                                >
                                  {c.label}
                                </text>
                              </g>
                            ))}
                          </svg>
                        );
                      })()
                    ) : (
                      /* Price Distribution Bar Chart */
                      <div className="h-56 flex items-end gap-2.5 pt-6 pb-2 px-2">
                        {(() => {
                          const maxCnt = Math.max(
                            ...priceTrendOrDist.series.map((s) => s.count),
                            1
                          );
                          return priceTrendOrDist.series.map((b, i) => {
                            const pct = Math.max(6, Math.round((b.count / maxCnt) * 100));
                            return (
                              <div
                                key={i}
                                className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                              >
                                <span className="text-[11px] font-semibold text-[#1F2937] tabular-nums">
                                  {b.count}
                                </span>
                                <div className="w-full bg-[#EFF6FF] rounded-t flex items-end h-36">
                                  <div
                                    className="w-full bg-[#2563EB] rounded-t"
                                    style={{ height: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-[#6B7280] truncate max-w-full tabular-nums">
                                  {b.label}
                                </span>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    )
                  ) : (
                    <div className="h-56 flex items-center justify-center text-[13px] text-[#6B7280]">
                      No price data available.
                    </div>
                  )}
                </div>

                {/* Property Type Distribution (Donut Chart + Blue Legend) */}
                <div className="lg:col-span-5 border border-[#E5E7EB] rounded-[6px] p-4 bg-[#FFFFFF] flex flex-col justify-between">
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#1F2937]">
                      Property Type Distribution
                    </h2>
                    <p className="text-[12px] text-[#6B7280]">
                      Breakdown of listings by property category
                    </p>
                  </div>

                  {propertyTypeDist.length > 0 ? (
                    <div className="flex items-center gap-6 my-auto py-3">
                      {/* SVG Donut Chart */}
                      <div className="relative w-36 h-36 shrink-0 mx-auto">
                        <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
                          {(() => {
                            let cumulativePct = 0;
                            return propertyTypeDist.map((slice) => {
                              const dashArray = `${slice.pct} ${100 - slice.pct}`;
                              const dashOffset = 100 - cumulativePct;
                              cumulativePct += slice.pct;
                              return (
                                <circle
                                  key={slice.name}
                                  cx="21"
                                  cy="21"
                                  r="15.91549431"
                                  fill="transparent"
                                  stroke={slice.color}
                                  strokeWidth="6"
                                  strokeDasharray={dashArray}
                                  strokeDashoffset={dashOffset}
                                >
                                  <title>{`${slice.name}: ${slice.count} (${slice.pct.toFixed(1)}%)`}</title>
                                </circle>
                              );
                            });
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[16px] font-semibold text-[#1F2937] tabular-nums">
                            {filteredRows.length}
                          </span>
                          <span className="text-[10.5px] text-[#6B7280]">Listings</span>
                        </div>
                      </div>

                      {/* Clean Blue-Shade Legend */}
                      <div className="flex-1 space-y-2">
                        {propertyTypeDist.map((item) => (
                          <div
                            key={item.name}
                            className="flex items-center justify-between text-[12.5px]"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <span
                                className="w-2.5 h-2.5 rounded-xs shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-[#1F2937] truncate">{item.name}</span>
                            </div>
                            <span className="text-[#6B7280] font-medium tabular-nums whitespace-nowrap">
                              {item.count} ({item.pct.toFixed(0)}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-44 flex items-center justify-center text-[13px] text-[#6B7280]">
                      Property Type column not mapped.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ROW 3: AVERAGE PROPERTY PRICE BY LOCATION (HORIZONTAL BAR CHART) */}
            {(activeNav === 'Dashboard' || activeNav === 'Location Analysis') && locationCol && (
              <div className="border border-[#E5E7EB] rounded-[6px] p-4 bg-[#FFFFFF]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#1F2937]">
                      Average Property Price by Location
                    </h2>
                    <p className="text-[12px] text-[#6B7280]">
                      Comparison of average property valuation across top locations
                    </p>
                  </div>

                  <div className="flex items-center gap-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded p-0.5 self-start">
                    {([5, 10, 15] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setTopNLocations(n)}
                        className={`px-2.5 py-1 text-[12px] font-medium rounded transition-colors ${
                          topNLocations === n
                            ? 'bg-[#2563EB] text-white'
                            : 'text-[#6B7280] hover:text-[#1F2937]'
                        }`}
                      >
                        Top {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {(() => {
                    const maxPrice = Math.max(
                      ...locationAnalysis.byPrice.map((l) => l.avgPrice),
                      1
                    );
                    return locationAnalysis.byPrice.map((loc) => {
                      const widthPct = Math.max(4, (loc.avgPrice / maxPrice) * 100);
                      return (
                        <div
                          key={loc.location}
                          className="grid grid-cols-12 items-center gap-3 text-[13px]"
                        >
                          <div className="col-span-3 sm:col-span-2 text-[#1F2937] font-medium truncate">
                            {loc.location}
                          </div>
                          <div className="col-span-6 sm:col-span-8 bg-[#EFF6FF] h-5 rounded-xs overflow-hidden">
                            <div
                              className="bg-[#2563EB] h-full rounded-xs transition-all"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                          <div className="col-span-3 sm:col-span-2 text-right font-semibold text-[#1F2937] tabular-nums">
                            {formatINR(loc.avgPrice)}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* ROW 4: PRICE VS AREA (SCATTER PLOT) + BHK ANALYSIS (BAR CHART) */}
            {(activeNav === 'Dashboard' || activeNav === 'Price Analysis') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left: Price vs Area Scatter Plot */}
                <div className="border border-[#E5E7EB] rounded-[6px] p-4 bg-[#FFFFFF]">
                  <div className="mb-3">
                    <h2 className="text-[16px] font-semibold text-[#1F2937]">
                      Price vs Area
                    </h2>
                    <p className="text-[12px] text-[#6B7280]">
                      X-axis: Area (sq ft) · Y-axis: Property Price
                    </p>
                  </div>

                  {priceAndBhkAnalysis.scatter.length > 0 ? (
                    (() => {
                      const pts = priceAndBhkAnalysis.scatter;
                      const minX = Math.min(...pts.map((p) => p.area)) * 0.95;
                      const maxX = Math.max(...pts.map((p) => p.area)) * 1.02;
                      const minY = Math.min(...pts.map((p) => p.price)) * 0.9;
                      const maxY = Math.max(...pts.map((p) => p.price)) * 1.05;
                      const spanX = maxX - minX || 1;
                      const spanY = maxY - minY || 1;
                      const w = 500;
                      const h = 220;
                      const padL = 55;
                      const padR = 16;
                      const padT = 14;
                      const padB = 28;
                      const plotW = w - padL - padR;
                      const plotH = h - padT - padB;

                      const reg = priceAndBhkAnalysis.regression;
                      let lineCoords: { x1: number; y1: number; x2: number; y2: number } | null = null;
                      if (reg) {
                        const yStart = reg.slope * minX + reg.intercept;
                        const yEnd = reg.slope * maxX + reg.intercept;
                        const clampY = (yv: number) => Math.max(minY, Math.min(maxY, yv));
                        lineCoords = {
                          x1: padL,
                          y1: padT + plotH - ((clampY(yStart) - minY) / spanY) * plotH,
                          x2: padL + plotW,
                          y2: padT + plotH - ((clampY(yEnd) - minY) / spanY) * plotH
                        };
                      }

                      return (
                        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56">
                          {[0, 0.25, 0.5, 0.75, 1].map((g) => {
                            const y = padT + g * plotH;
                            const val = maxY - g * spanY;
                            return (
                              <g key={g}>
                                <line
                                  x1={padL}
                                  x2={w - padR}
                                  y1={y}
                                  y2={y}
                                  stroke="#E5E7EB"
                                  strokeWidth="1"
                                />
                                <text
                                  x={padL - 6}
                                  y={y + 3}
                                  textAnchor="end"
                                  fontSize="10"
                                  fill="#6B7280"
                                >
                                  {formatINR(val)}
                                </text>
                              </g>
                            );
                          })}
                          {/* Trendline */}
                          {lineCoords && (
                            <line
                              x1={lineCoords.x1}
                              y1={lineCoords.y1}
                              x2={lineCoords.x2}
                              y2={lineCoords.y2}
                              stroke="#1E3A8A"
                              strokeWidth="1.5"
                              strokeDasharray="4 3"
                            />
                          )}
                          {/* Scatter Points */}
                          {pts.map((pt, idx) => {
                            const cx = padL + ((pt.area - minX) / spanX) * plotW;
                            const cy = padT + plotH - ((pt.price - minY) / spanY) * plotH;
                            return (
                              <circle
                                key={idx}
                                cx={cx}
                                cy={cy}
                                r="4"
                                fill="#2563EB"
                                fillOpacity="0.65"
                              >
                                <title>{`${pt.location} · ${pt.area} sqft · ${formatINR(pt.price)}`}</title>
                              </circle>
                            );
                          })}
                          {/* X-axis Min/Max Labels */}
                          <text x={padL} y={h - 6} fontSize="10" fill="#6B7280">
                            {Math.round(minX)} sqft
                          </text>
                          <text x={w - padR} y={h - 6} textAnchor="end" fontSize="10" fill="#6B7280">
                            {Math.round(maxX)} sqft
                          </text>
                        </svg>
                      );
                    })()
                  ) : (
                    <div className="h-56 flex items-center justify-center text-[13px] text-[#6B7280]">
                      Map both Price and Area columns to view scatter plot.
                    </div>
                  )}
                </div>

                {/* Right: BHK Analysis Bar Chart */}
                <div className="border border-[#E5E7EB] rounded-[6px] p-4 bg-[#FFFFFF] flex flex-col justify-between">
                  <div className="mb-3">
                    <h2 className="text-[16px] font-semibold text-[#1F2937]">
                      BHK Analysis
                    </h2>
                    <p className="text-[12px] text-[#6B7280]">
                      Property supply and mean price by bedroom configuration
                    </p>
                  </div>

                  {priceAndBhkAnalysis.bhkSeries.length > 0 ? (
                    <div className="h-56 flex items-end gap-5 pt-6 pb-2 px-4">
                      {(() => {
                        const maxC = Math.max(
                          ...priceAndBhkAnalysis.bhkSeries.map((b) => b.count),
                          1
                        );
                        return priceAndBhkAnalysis.bhkSeries.map((b) => {
                          const hPct = Math.max(8, Math.round((b.count / maxC) * 100));
                          return (
                            <div
                              key={b.label}
                              className="flex-1 flex flex-col items-center justify-end h-full gap-1.5"
                            >
                              <div className="text-center">
                                <div className="text-[12px] font-semibold text-[#1F2937] tabular-nums">
                                  {b.count} units
                                </div>
                                <div className="text-[10.5px] text-[#6B7280] tabular-nums">
                                  Avg {formatINR(b.avgPrice)}
                                </div>
                              </div>
                              <div className="w-full max-w-[64px] bg-[#EFF6FF] rounded-t flex items-end h-32">
                                <div
                                  className="w-full bg-[#2563EB] rounded-t transition-all"
                                  style={{ height: `${hPct}%` }}
                                />
                              </div>
                              <span className="text-[12px] font-medium text-[#1F2937]">
                                {b.label}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  ) : (
                    <div className="h-56 flex items-center justify-center text-[13px] text-[#6B7280]">
                      BHK column not mapped.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ROW 5: KEY MARKET INSIGHTS */}
            {(activeNav === 'Dashboard' ||
              activeNav === 'Market Analysis' ||
              activeNav === 'Location Analysis' ||
              activeNav === 'Price Analysis') &&
              marketInsights.length > 0 && (
                <div className="border border-[#E5E7EB] rounded-[6px] p-4 bg-[#FFFFFF]">
                  <div className="text-[14px] font-semibold text-[#1F2937] uppercase tracking-wide pb-2.5 mb-2.5 border-b border-[#E5E7EB]">
                    Market Insights
                  </div>
                  <ul className="space-y-2">
                    {marketInsights.map((item, idx) => (
                      <li key={idx} className="flex items-baseline gap-2.5 text-[13.5px] text-[#1F2937]">
                        <span className="text-[#2563EB] font-bold text-[15px] leading-none">•</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* ROW 6: PROPERTY EXPLORER DATA TABLE */}
            {(activeNav === 'Dashboard' || activeNav === 'Property Explorer') && (
              <div className="border border-[#E5E7EB] rounded-[6px] bg-[#FFFFFF] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#1F2937] uppercase tracking-wide">
                      Property Explorer
                    </h2>
                    <p className="text-[12px] text-[#6B7280]">
                      Showing {explorerTableRows.length.toLocaleString('en-IN')} filtered property records
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-[#6B7280] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filter table..."
                        className="pl-8 pr-3 py-1 text-[12.5px] border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#1F2937] focus:outline-none focus:border-[#2563EB]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-[#1E3A8A] text-white text-[12.5px] font-medium rounded flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download CSV</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[380px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#F9FAFB] border-b border-[#E5E7EB] z-10">
                      <tr className="text-[12px] font-semibold text-[#6B7280]">
                        <th
                          onClick={() => toggleSort('location')}
                          className="py-2.5 px-4 cursor-pointer hover:text-[#1F2937] select-none"
                        >
                          <div className="flex items-center gap-1">
                            <span>Location</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th
                          onClick={() => toggleSort('type')}
                          className="py-2.5 px-4 cursor-pointer hover:text-[#1F2937] select-none"
                        >
                          <div className="flex items-center gap-1">
                            <span>Property Type</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th
                          onClick={() => toggleSort('bhk')}
                          className="py-2.5 px-4 cursor-pointer hover:text-[#1F2937] select-none text-right"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>BHK</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th
                          onClick={() => toggleSort('area')}
                          className="py-2.5 px-4 cursor-pointer hover:text-[#1F2937] select-none text-right"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Area</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th
                          onClick={() => toggleSort('price')}
                          className="py-2.5 px-4 cursor-pointer hover:text-[#1F2937] select-none text-right"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Price</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th
                          onClick={() => toggleSort('pps')}
                          className="py-2.5 px-4 cursor-pointer hover:text-[#1F2937] select-none text-right"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Price / Sq Ft</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB] text-[13px]">
                      {explorerTableRows.slice(0, 100).map((r, i) => (
                        <tr
                          key={i}
                          className={`${
                            i % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#F9FAFB]'
                          } hover:bg-[#EFF6FF]/60 transition-colors`}
                        >
                          <td className="py-2 px-4 font-medium text-[#1F2937] whitespace-nowrap">
                            {r._location || '—'}
                          </td>
                          <td className="py-2 px-4 text-[#6B7280] whitespace-nowrap">
                            {r._property_type || '—'}
                          </td>
                          <td className="py-2 px-4 text-right text-[#1F2937] tabular-nums whitespace-nowrap">
                            {r._bhk !== null ? `${r._bhk} BHK` : '—'}
                          </td>
                          <td className="py-2 px-4 text-right text-[#1F2937] tabular-nums whitespace-nowrap">
                            {r._area !== null ? `${Math.round(r._area).toLocaleString('en-IN')} sqft` : '—'}
                          </td>
                          <td className="py-2 px-4 text-right font-semibold text-[#1F2937] tabular-nums whitespace-nowrap">
                            {formatINR(r._price)}
                          </td>
                          <td className="py-2 px-4 text-right text-[#2563EB] font-medium tabular-nums whitespace-nowrap">
                            {r._price_per_sqft !== null
                              ? `₹${Math.round(r._price_per_sqft).toLocaleString('en-IN')}`
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
