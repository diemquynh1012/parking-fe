import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import 'tailwindcss/tailwind.css';


const BLOCKED = -1;
const EMPTY = 0;

function LegendBar() {
    return (
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
            <div className="flex items-center space-x-2">
                <span className="inline-block w-5 h-5 rounded" style={{ background: "#b03a3a", border: "1px solid #ccc" }} />
                <span className="text-sm">Blocked</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="inline-block w-5 h-5 rounded" style={{ background: "#eeeeee", border: "1px solid #ccc" }} />
                <span className="text-sm">Empty</span>
            </div>
        </div>
    );
}

export default function ParkingDesignPage() {
    const [step, setStep] = useState(1);
    const [size, setSize] = useState({ rows: 10, cols: 10 });
    const [blocked, setBlocked] = useState([]);
    const [criteria, setCriteria] = useState({
        laneType: 'two-way',
        floors: 1,
        cellSize: 32,
    });
    const [resultGrid, setResultGrid] = useState([]);

    const handleSizeChange = e => {
        const { name, value } = e.target;
        setSize(s => ({ ...s, [name]: Number(value) }));
        setBlocked([]);
    };

    const grid = Array.from({ length: size.rows }, (_, r) =>
        Array.from({ length: size.cols }, (_, c) =>
            blocked.some(b => b.r === r && b.c === c) ? BLOCKED : EMPTY
        )
    );
    const toggleBlocked = (r, c) => {
        setBlocked(b =>
            b.some(cell => cell.r === r && cell.c === c)
                ? b.filter(cell => !(cell.r === r && cell.c === c))
                : [...b, { r, c }]
        );
    };

    const handleCriteriaChange = e => {
        const { name, value } = e.target;
        setCriteria(c => ({ ...c, [name]: value }));
    };

    // Color map for layout values
    const layoutColorMap = {
        0: "#eeeeee", // Empty (blocked)
        1: "#9e9e9e", // Driveway
        2: "#2e7d32", // Horizontal stall
        3: "#1976d2", // Vertical stall (blue)
        7: "#b39ddb", // Exit gate (light purple)
        8: "#4527a0", // Entrance gate (dark purple)
        9: "#b03a3a", // Blocked
    };

    // Legend for layout preview
    function LayoutLegendBar() {
        return (
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[0], border: "1px solid #ccc" }} />
                    <span className="text-sm">Empty</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[9], border: "1px solid #ccc" }} />
                    <span className="text-sm">Blocked</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[1], border: "1px solid #ccc" }} />
                    <span className="text-sm">Driveway</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[2], border: "1px solid #ccc" }} />
                    <span className="text-sm">Perpendicular</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[3], border: "1px solid #ccc" }} />
                    <span className="text-sm">Parallel</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[8], border: "1px solid #ccc" }} />
                    <span className="text-sm">Entrance</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[7], border: "1px solid #ccc" }} />
                    <span className="text-sm">Exit</span>
                </div>
            </div>
        );
    }

    // Entrance/exit state
    // Default positions: entrance middle of first row, exit middle of last row
    function getDefaultEntrances(laneType, rows, cols) {
        if (laneType === "two-way") {
            const mid = Math.floor(cols / 2);
            return {
                entrance: [0, mid],
                exitGate: [0, mid],
            };
        } else {
            const mid = Math.floor(cols / 2);
            return {
                entrance: [0, mid],
                exitGate: [rows - 1, mid],
            };
        }
    }

    const [entrance, setEntrance] = useState(getDefaultEntrances(criteria.laneType, size.rows, size.cols).entrance);
    const [exitGate, setExitGate] = useState(getDefaultEntrances(criteria.laneType, size.rows, size.cols).exitGate);
    const [selectMode, setSelectMode] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reset entrance/exit when laneType or size changes
    useEffect(() => {
        const { entrance, exitGate } = getDefaultEntrances(criteria.laneType, size.rows, size.cols);
        setEntrance(entrance);
        setExitGate(exitGate);
        setSelectMode(null);
    }, [criteria.laneType, size.rows, size.cols]);

    // Sync exit with entrance in two-way mode
    useEffect(() => {
        if (criteria.laneType === "two-way") {
            setExitGate(entrance);
        }
    }, [entrance, criteria.laneType]);

    // Merge step 2 and 3: Generate on the fly, no step state after 1
    useEffect(() => {
        setResultGrid(grid);
    }, [size, blocked, criteria]);

    // Handle generate layout
    const handleGenerateLayout = async () => {
        setLoading(true);
        try {
            const body = {
                rows: size.rows,
                cols: size.cols,
                blocked: blocked.map(cell => [cell.r, cell.c]),
                entrance,
                exit_gate: exitGate,
                one_way: criteria.laneType === "one-way"
            };
            console.log("Request body:", body);
            const res = await fetch("http://160.191.49.99:8000/optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.layout) {
                // console.log("Generated layout:", data.layout);
                setResultGrid(data.layout);
            } else {
                alert("Failed to generate layout.");
            }
        } catch (e) {
            console.error("Error generating layout:", e);
            alert("Error generating layout.", e);
        }
        setLoading(false);
    };

    // UI for entrance/exit selection buttons
    function EntranceExitButtons() {
        if (criteria.laneType === "two-way") {
            return (
                <button
                    className={`px-3 py-1 rounded border ${selectMode === "entrance" ? "bg-purple-800 text-white border-purple-800" : "bg-gray-100 border-gray-300"}`}
                    onClick={() => setSelectMode(selectMode === "entrance" ? null : "entrance")}
                    type="button"
                >
                    Set Entrance/Exit
                </button>
            );
        }
        return (
            <div className="flex gap-2">
                <button
                    className={`px-3 py-1 rounded border ${selectMode === "entrance" ? "bg-purple-800 text-white border-purple-800" : "bg-gray-100 border-gray-300"}`}
                    onClick={() => setSelectMode(selectMode === "entrance" ? null : "entrance")}
                    type="button"
                >
                    Set Entrance
                </button>
                <button
                    className={`px-3 py-1 rounded border ${selectMode === "exit" ? "bg-purple-400 text-white border-purple-400" : "bg-gray-100 border-gray-300"}`}
                    onClick={() => setSelectMode(selectMode === "exit" ? null : "exit")}
                    type="button"
                >
                    Set Exit
                </button>
            </div>
        );
    }

    // Cell rendering logic for step 2 grid
    function getCellType(r, c) {
        if (entrance[0] === r && entrance[1] === c) {
            return 8; // Entrance (priority)
        }
        if (criteria.laneType === "one-way" && exitGate[0] === r && exitGate[1] === c) {
            return 7; // Exit
        }
        if (grid[r][c] === BLOCKED) {
            return 9; // Blocked
        }
        return 0; // Empty
    }

    // Title for cell
    function getCellTitle(r, c) {
        if (entrance[0] === r && entrance[1] === c) return "Entrance";
        if (criteria.laneType === "one-way" && exitGate[0] === r && exitGate[1] === c) return "Exit";
        if (grid[r][c] === BLOCKED) return "Blocked";
        return "Empty";
    }

    // Zone and feature states
    const [zoneMap, setZoneMap] = useState(() => 
        Array.from({ length: size.rows }, () => 
            Array.from({ length: size.cols }, () => null)
        )
    );
    const [selectedCells, setSelectedCells] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectStart, setSelectStart] = useState(null);
    const [featureMap, setFeatureMap] = useState({});
    const [showZoneDialog, setShowZoneDialog] = useState(false);
    const [selectedZone, setSelectedZone] = useState('public');
    const [selectedFeatures, setSelectedFeatures] = useState({
        hasRoof: false,
        hasEVCharger: false
    });

    // Export states
    const [showExportDialog, setShowExportDialog] = useState(false);
    const [exportSettings, setExportSettings] = useState({
        fileName: 'parking-layout',
        fileType: 'svg',
        includeZones: true,
        includeFeatures: true,
        includeLegend: true,
        paperSize: 'A4',
        orientation: 'landscape'
    });

    // Save states
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');

    // Zone color mapping
    const zoneColorMap = {
        public: '#bbdefb',
        private: '#ffe082',
        vip: '#f8bbd0',
    };

    // Reset zone and feature maps when size changes
    useEffect(() => {
        setZoneMap(Array.from({ length: size.rows }, () => 
            Array.from({ length: size.cols }, () => null)
        ));
        setFeatureMap({});
        setSelectedCells([]);
    }, [size.rows, size.cols]);

    // Helper function to get rectangle selection
    const getRectangleSelection = (start, end) => {
        if (!start || !end) return [];
        const minR = Math.min(start.r, end.r);
        const maxR = Math.max(start.r, end.r);
        const minC = Math.min(start.c, end.c);
        const maxC = Math.max(start.c, end.c);
        
        const cells = [];
        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                cells.push({ r, c });
            }
        }
        return cells;
    };

    // Handle zone and feature assignment
    const handleAssignZoneAndFeatures = () => {
        if (selectedCells.length === 0) return;

        // Update zone map
        setZoneMap(prevMap => {
            const newMap = prevMap.map(row => [...row]);
            selectedCells.forEach(({ r, c }) => {
                if (newMap[r]) {
                    newMap[r][c] = selectedZone;
                }
            });
            console.log("Updated zone map:", newMap);
            return newMap;
        });
        
        // Update feature map
        setFeatureMap(prevMap => {
            const updated = { ...prevMap };
            selectedCells.forEach(({ r, c }) => {
                const key = `${r}-${c}`;
                updated[key] = {
                    hasRoof: selectedFeatures.hasRoof,
                    hasEVCharger: selectedFeatures.hasEVCharger,
                };
            });
            console.log("Updated feature map:", updated);
            return updated;
        });

        // Reset selection and close dialog (keep form values for next use)
        setSelectedCells([]);
        setIsSelecting(false);
        setSelectStart(null);
        setShowZoneDialog(false);
        // Don't reset selectedZone and selectedFeatures - keep them for next selection
    };

    // Clear selection
    const clearSelection = () => {
        setSelectedCells([]);
        setIsSelecting(false);
        setSelectStart(null);
        setShowZoneDialog(false);
    };
    // Clear zone and features for selected cells
    const clearZoneAndFeatures = () => {
        if (selectedCells.length === 0) return;

        setZoneMap(prevMap => {
            const newMap = prevMap.map(row => [...row]);
            selectedCells.forEach(({ r, c }) => {
                if (newMap[r]) {
                    newMap[r][c] = null;
                }
            });
            return newMap;
        });

        setFeatureMap(prevMap => {
            const updated = { ...prevMap };
            selectedCells.forEach(({ r, c }) => {
                const key = `${r}-${c}`;
                delete updated[key];
            });
            return updated;
        });

        clearSelection();
    };

    // Handle export
    const handleExport = async () => {
        console.log('Exporting with settings:', exportSettings);
        
        try {
            // Check if we have a layout to export
            if (resultGrid.length === 0) {
                alert('No layout to export. Please generate a layout first.');
                return;
            }

            const { fileType, fileName, includeZones, includeFeatures, includeLegend } = exportSettings;
            
            if (fileType === 'svg') {
                await exportAsSVG(fileName, includeZones, includeFeatures, includeLegend);
            } else if (fileType === 'png' || fileType === 'jpg') {
                await exportAsImage(fileType, fileName, includeZones, includeFeatures, includeLegend);
            } else if (fileType === 'pdf') {
                await exportAsPDF(fileName, includeZones, includeFeatures, includeLegend);
            }
            
            setShowExportDialog(false);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        }
    };

    // Export as SVG
    const exportAsSVG = async (fileName, includeZones, includeFeatures, includeLegend) => {
        const cellSize = criteria.cellSize;
        const gridWidth = size.cols * cellSize + (size.cols - 1) * 2; // 2px gap
        const gridHeight = size.rows * cellSize + (size.rows - 1) * 2;
        const legendHeight = includeLegend ? 200 : 0; // Increased for complete legend
        const totalHeight = gridHeight + legendHeight + 60; // padding
        
        let svg = `<svg width="${gridWidth + 40}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Grid cells
        resultGrid.forEach((row, r) => {
            row.forEach((cell, c) => {
                const x = 20 + c * (cellSize + 2);
                const y = 20 + r * (cellSize + 2);
                const zone = zoneMap[r]?.[c];
                const features = featureMap[`${r}-${c}`] || {};
                
                // Cell background
                const cellColor = layoutColorMap[cell] || '#b03a3a';
                svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${cellColor}" stroke="#ccc" stroke-width="1" rx="4"/>`;
                
                // Zone border
                if (includeZones && zone) {
                    const zoneColor = zoneColorMap[zone];
                    svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="none" stroke="${zoneColor}" stroke-width="3" rx="4"/>`;
                }
                
                // Feature icons
                if (includeFeatures) {
                    let iconX = x + cellSize / 2;
                    let iconY = y + cellSize / 2;
                    const fontSize = Math.max(8, cellSize / 6);
                    
                    if (features.hasEVCharger && features.hasRoof) {
                        svg += `<text x="${iconX - 5}" y="${iconY}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}">⚡</text>`;
                        svg += `<text x="${iconX + 5}" y="${iconY}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}">🏠</text>`;
                    } else if (features.hasEVCharger) {
                        svg += `<text x="${iconX}" y="${iconY}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}">⚡</text>`;
                    } else if (features.hasRoof) {
                        svg += `<text x="${iconX}" y="${iconY}" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}">🏠</text>`;
                    }
                }
            });
        });
        
        // Complete Legend
        if (includeLegend) {
            const legendY = gridHeight + 60;
            svg += `<text x="20" y="${legendY}" font-size="14" font-weight="bold">Legend</text>`;
            
            let currentY = legendY + 25;
            
            // Layout types legend
            svg += `<text x="20" y="${currentY}" font-size="12" font-weight="bold">Layout Types:</text>`;
            currentY += 20;
            let legendX = 20;
            Object.entries(layoutColorMap).forEach(([value, color]) => {
                const labels = { 0: 'Empty', 1: 'Driveway', 2: 'Perpendicular', 3: 'Parallel', 7: 'Exit', 8: 'Entrance', 9: 'Blocked' };
                if (labels[value]) {
                    svg += `<rect x="${legendX}" y="${currentY - 10}" width="12" height="12" fill="${color}" stroke="#ccc"/>`;
                    svg += `<text x="${legendX + 18}" y="${currentY}" font-size="10">${labels[value]}</text>`;
                    legendX += 100;
                    if (legendX > gridWidth - 50) {
                        legendX = 20;
                        currentY += 20;
                    }
                }
            });
            
            // Zone types legend
            currentY += 35;
            svg += `<text x="20" y="${currentY}" font-size="12" font-weight="bold">Zone Types:</text>`;
            currentY += 20;
            legendX = 20;
            Object.entries(zoneColorMap).forEach(([zoneName, color]) => {
                const zoneLabels = { public: 'Public Zone', private: 'Private Zone', vip: 'VIP Zone' };
                svg += `<rect x="${legendX}" y="${currentY - 10}" width="12" height="12" fill="none" stroke="${color}" stroke-width="2"/>`;
                svg += `<text x="${legendX + 18}" y="${currentY}" font-size="10">${zoneLabels[zoneName]}</text>`;
                legendX += 120;
            });
            
            // Feature types legend
            currentY += 35;
            svg += `<text x="20" y="${currentY}" font-size="12" font-weight="bold">Features:</text>`;
            currentY += 20;
            legendX = 20;
            svg += `<text x="${legendX}" y="${currentY}" font-size="14">⚡</text>`;
            svg += `<text x="${legendX + 20}" y="${currentY}" font-size="10">EV Charger</text>`;
            legendX += 120;
            svg += `<text x="${legendX}" y="${currentY}" font-size="14">🏠</text>`;
            svg += `<text x="${legendX + 20}" y="${currentY}" font-size="10">Covered/Roof</text>`;
        }
        
        svg += '</svg>';
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        downloadFile(blob, `${fileName}.svg`);
    };

    // Export as Image (PNG/JPG)
    const exportAsImage = async (format, fileName, includeZones, includeFeatures, includeLegend) => {
        // Create a temporary canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const cellSize = criteria.cellSize;
        const gridWidth = size.cols * cellSize + (size.cols - 1) * 2;
        const gridHeight = size.rows * cellSize + (size.rows - 1) * 2;
        const legendHeight = includeLegend ? 200 : 0; // Increased for complete legend
        
        canvas.width = gridWidth + 40;
        canvas.height = gridHeight + legendHeight + 70;
        
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        resultGrid.forEach((row, r) => {
            row.forEach((cell, c) => {
                const x = 20 + c * (cellSize + 2);
                const y = 20 + r * (cellSize + 2);
                const zone = zoneMap[r]?.[c];
                const features = featureMap[`${r}-${c}`] || {};
                
                // Cell background
                const cellColor = layoutColorMap[cell] || '#b03a3a';
                ctx.fillStyle = cellColor;
                ctx.fillRect(x, y, cellSize, cellSize);
                
                // Cell border
                ctx.strokeStyle = '#ccc';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cellSize, cellSize);
                
                // Zone border
                if (includeZones && zone) {
                    const zoneColor = zoneColorMap[zone];
                    ctx.strokeStyle = zoneColor;
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, cellSize, cellSize);
                }
                
                // Feature icons
                if (includeFeatures) {
                    ctx.fillStyle = 'black';
                    ctx.font = `${Math.max(8, cellSize / 6)}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    let iconX = x + cellSize / 2;
                    let iconY = y + cellSize / 2;
                    
                    if (features.hasEVCharger && features.hasRoof) {
                        ctx.fillText('⚡', iconX - 5, iconY);
                        ctx.fillText('🏠', iconX + 5, iconY);
                    } else if (features.hasEVCharger) {
                        ctx.fillText('⚡', iconX, iconY);
                    } else if (features.hasRoof) {
                        ctx.fillText('🏠', iconX, iconY);
                    }
                }
            });
        });
        
        // Draw complete legend
        if (includeLegend) {
            const legendY = gridHeight + 60;
            ctx.fillStyle = 'black';
            ctx.font = '14px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Legend', 20, legendY);
            
            let currentY = legendY + 25;
            
            // Layout types legend
            ctx.font = '12px Arial';
            ctx.fillText('Layout Types:', 20, currentY);
            currentY += 20;
            let legendX = 20;
            ctx.font = '10px Arial';
            
            Object.entries(layoutColorMap).forEach(([value, color]) => {
                const labels = { 0: 'Empty', 1: 'Driveway', 2: 'Perpendicular', 3: 'Parallel', 7: 'Exit', 8: 'Entrance', 9: 'Blocked' };
                if (labels[value]) {
                    ctx.fillStyle = color;
                    ctx.fillRect(legendX, currentY - 8, 12, 12);
                    ctx.strokeStyle = '#ccc';
                    ctx.strokeRect(legendX, currentY - 8, 12, 12);
                    
                    ctx.fillStyle = 'black';
                    ctx.fillText(labels[value], legendX + 18, currentY);
                    
                    legendX += 100;
                    if (legendX > gridWidth - 50) {
                        legendX = 20;
                        currentY += 20;
                    }
                }
            });
            
            // Zone types legend
            currentY += 35;
            ctx.font = '12px Arial';
            ctx.fillText('Zone Types:', 20, currentY);
            currentY += 20;
            legendX = 20;
            ctx.font = '10px Arial';
            
            Object.entries(zoneColorMap).forEach(([zoneName, color]) => {
                const zoneLabels = { public: 'Public Zone', private: 'Private Zone', vip: 'VIP Zone' };
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.strokeRect(legendX, currentY - 8, 12, 12);
                
                ctx.fillStyle = 'black';
                ctx.fillText(zoneLabels[zoneName], legendX + 18, currentY);
                legendX += 120;
            });
            
            // Feature types legend
            currentY += 35;
            ctx.font = '12px Arial';
            ctx.fillText('Features:', 20, currentY);
            currentY += 20;
            legendX = 20;
            
            // EV Charger
            ctx.fillStyle = '#ffd700'; // Gold color for lightning
            ctx.fillRect(legendX, currentY - 8, 12, 12);
            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(legendX, currentY - 8, 12, 12);
            ctx.fillStyle = 'black';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', legendX + 6, currentY - 2);
            
            ctx.textAlign = 'left';
            ctx.font = '10px Arial';
            ctx.fillText('EV Charger', legendX + 18, currentY);
            legendX += 120;
            
            // Covered/Roof
            ctx.fillStyle = '#8fbc8f'; // Light green for house
            ctx.fillRect(legendX, currentY - 8, 12, 12);
            ctx.strokeStyle = '#ccc';
            ctx.strokeRect(legendX, currentY - 8, 12, 12);
            ctx.fillStyle = 'black';
            ctx.font = '8px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🏠', legendX + 6, currentY - 2);
            
            ctx.textAlign = 'left';
            ctx.font = '10px Arial';
            ctx.fillText('Covered/Roof', legendX + 18, currentY);
        }
        
        // Convert to blob and download
        canvas.toBlob(blob => {
            downloadFile(blob, `${fileName}.${format}`);
        }, format === 'jpg' ? 'image/jpeg' : 'image/png');
    };

    // Export as PDF
    const exportAsPDF = async (fileName, includeZones, includeFeatures, includeLegend) => {
        try {
            // For PDF, we'll create a high-quality PNG and provide instructions
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const cellSize = criteria.cellSize;
            const gridWidth = size.cols * cellSize + (size.cols - 1) * 2;
            const gridHeight = size.rows * cellSize + (size.rows - 1) * 2;
            const legendHeight = includeLegend ? 200 : 0;
            
            // Higher resolution for PDF quality
            const scale = 3; // 3x resolution for better PDF quality
            canvas.width = (gridWidth + 40) * scale;
            canvas.height = (gridHeight + legendHeight + 60) * scale;
            
            // Scale the context
            ctx.scale(scale, scale);
            
            // White background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);
            
            // Draw grid with higher quality
            resultGrid.forEach((row, r) => {
                row.forEach((cell, c) => {
                    const x = 20 + c * (cellSize + 2);
                    const y = 20 + r * (cellSize + 2);
                    const zone = zoneMap[r]?.[c];
                    const features = featureMap[`${r}-${c}`] || {};
                    
                    // Cell background
                    const cellColor = layoutColorMap[cell] || '#b03a3a';
                    ctx.fillStyle = cellColor;
                    ctx.fillRect(x, y, cellSize, cellSize);
                    
                    // Cell border
                    ctx.strokeStyle = '#ccc';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x, y, cellSize, cellSize);
                    
                    // Zone border
                    if (includeZones && zone) {
                        const zoneColor = zoneColorMap[zone];
                        ctx.strokeStyle = zoneColor;
                        ctx.lineWidth = 3;
                        ctx.strokeRect(x, y, cellSize, cellSize);
                    }
                    
                    // Feature icons
                    if (includeFeatures) {
                        ctx.fillStyle = 'black';
                        ctx.font = `${Math.max(8, cellSize / 6)}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        let iconX = x + cellSize / 2;
                        let iconY = y + cellSize / 2;
                        
                        if (features.hasEVCharger && features.hasRoof) {
                            ctx.fillText('⚡', iconX - 5, iconY);
                            ctx.fillText('🏠', iconX + 5, iconY);
                        } else if (features.hasEVCharger) {
                            ctx.fillText('⚡', iconX, iconY);
                        } else if (features.hasRoof) {
                            ctx.fillText('🏠', iconX, iconY);
                        }
                    }
                });
            });
            
            // Draw complete legend
            if (includeLegend) {
                const legendY = gridHeight + 60;
                ctx.fillStyle = 'black';
                ctx.font = '14px Arial';
                ctx.textAlign = 'left';
                ctx.fillText('Legend', 20, legendY);
                
                let currentY = legendY + 25;
                
                // Layout types legend
                ctx.font = '12px Arial';
                ctx.fillText('Layout Types:', 20, currentY);
                currentY += 20;
                let legendX = 20;
                ctx.font = '10px Arial';
                
                Object.entries(layoutColorMap).forEach(([value, color]) => {
                    const labels = { 0: 'Empty', 1: 'Driveway', 2: 'Perpendicular', 3: 'Parallel', 7: 'Exit', 8: 'Entrance', 9: 'Blocked' };
                    if (labels[value]) {
                        ctx.fillStyle = color;
                        ctx.fillRect(legendX, currentY - 8, 12, 12);
                        ctx.strokeStyle = '#ccc';
                        ctx.strokeRect(legendX, currentY - 8, 12, 12);
                        
                        ctx.fillStyle = 'black';
                        ctx.fillText(labels[value], legendX + 18, currentY);
                        
                        legendX += 100;
                        if (legendX > gridWidth - 50) {
                            legendX = 20;
                            currentY += 20;
                        }
                    }
                });
                
                // Zone types legend
                currentY += 35;
                ctx.font = '12px Arial';
                ctx.fillText('Zone Types:', 20, currentY);
                currentY += 20;
                legendX = 20;
                ctx.font = '10px Arial';
                
                Object.entries(zoneColorMap).forEach(([zoneName, color]) => {
                    const zoneLabels = { public: 'Public Zone', private: 'Private Zone', vip: 'VIP Zone' };
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(legendX, currentY - 8, 12, 12);
                    
                    ctx.fillStyle = 'black';
                    ctx.fillText(zoneLabels[zoneName], legendX + 18, currentY);
                    legendX += 120;
                });
                
                // Feature types legend
                currentY += 35;
                ctx.font = '12px Arial';
                ctx.fillText('Features:', 20, currentY);
                currentY += 20;
                legendX = 20;
                
                // EV Charger
                ctx.fillStyle = '#ffd700'; // Gold color for lightning
                ctx.fillRect(legendX, currentY - 8, 12, 12);
                ctx.strokeStyle = '#ccc';
                ctx.strokeRect(legendX, currentY - 8, 12, 12);
                ctx.fillStyle = 'black';
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⚡', legendX + 6, currentY - 2);
                
                ctx.textAlign = 'left';
                ctx.font = '10px Arial';
                ctx.fillText('EV Charger', legendX + 18, currentY);
                legendX += 120;
                
                // Covered/Roof
                ctx.fillStyle = '#8fbc8f'; // Light green for house
                ctx.fillRect(legendX, currentY - 8, 12, 12);
                ctx.strokeStyle = '#ccc';
                ctx.strokeRect(legendX, currentY - 8, 12, 12);
                ctx.fillStyle = 'black';
                ctx.font = '8px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('🏠', legendX + 6, currentY - 2);
                
                ctx.textAlign = 'left';
                ctx.font = '10px Arial';
                ctx.fillText('Covered/Roof', legendX + 18, currentY);
            }
            
            // Convert to high-quality PNG and download
            canvas.toBlob(blob => {
                downloadFile(blob, `${fileName}_HQ.png`);
                
                // Show instructions for PDF conversion
                alert(`High-quality PNG downloaded: ${fileName}_HQ.png\n\nTo convert to PDF:\n1. Open the PNG file\n2. Use "Print" and select "Save as PDF"\n3. Or use online converters like SmallPDF, ILovePDF\n\nThis provides better quality than automated PDF conversion.`);
            }, 'image/png', 1.0);
            
        } catch (error) {
            console.error('PDF export error:', error);
            alert('PDF export failed. Please try PNG or SVG format.');
        }
    };

    // Download file helper
    const downloadFile = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // GridCell component for better organization
    function GridCell({ r, c, cell, cellSize, isPreview = false }) {
        const zone = zoneMap[r]?.[c];
        const features = featureMap[`${r}-${c}`] || {};
        const isSelected = selectedCells.some(selected => selected.r === r && selected.c === c);
        const canEdit = resultGrid.length > 0 && !isPreview;

        const handleMouseDown = (e) => {
            if (!canEdit) return;
            e.preventDefault();
            setIsSelecting(true);
            setSelectStart({ r, c });
            setSelectedCells([{ r, c }]);
        };

        const handleMouseEnter = () => {
            if (!canEdit || !isSelecting || !selectStart) return;
            const newSelection = getRectangleSelection(selectStart, { r, c });
            setSelectedCells(newSelection);
        };

        const handleMouseUp = () => {
            if (!canEdit || !isSelecting) return;
            setIsSelecting(false);
            if (selectedCells.length > 0) {
                // Get the current state of the first selected cell to pre-populate the form
                const firstCell = selectedCells[0];
                const firstCellZone = zoneMap[firstCell.r]?.[firstCell.c] || 'public';
                const firstCellFeatures = featureMap[`${firstCell.r}-${firstCell.c}`] || { hasRoof: false, hasEVCharger: false };
                
                // Set form values to match current cell state
                setSelectedZone(firstCellZone);
                setSelectedFeatures({
                    hasRoof: firstCellFeatures.hasRoof,
                    hasEVCharger: firstCellFeatures.hasEVCharger
                });
                
                setShowZoneDialog(true);
            }
        };

        return (
            <div
                key={`${r}-${c}`}
                style={{
                    position: 'relative',
                    width: cellSize,
                    height: cellSize,
                    cursor: canEdit ? 'pointer' : 'default'
                }}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
                onMouseUp={handleMouseUp}
            >
                {/* Zone overlay - border only */}
                {zone && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 1,
                            borderRadius: 4,
                            border: `3px solid ${zoneColorMap[zone]}`,
                            boxSizing: 'border-box',
                            backgroundColor: 'transparent',
                        }}
                    />
                )}
                
                {/* Selection overlay */}
                {isSelected && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 3,
                            border: '2px solid #2563eb',
                            borderRadius: 4,
                            pointerEvents: 'none',
                        }}
                    />
                )}

                {/* Main layout cell */}
                <div
                    style={{
                        background: isPreview 
                            ? (cell === BLOCKED ? "#b03a3a" : "#eeeeee")
                            : (layoutColorMap[cell] || '#b03a3a'),
                        position: 'relative',
                        zIndex: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: Math.max(12, cellSize / 4),
                        fontWeight: 'bold',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        color: cell === 8 || cell === 7 ? layoutColorMap[9] : undefined,
                        borderWidth: (entrance[0] === r && entrance[1] === c) || (criteria.laneType === "one-way" && exitGate[0] === r && exitGate[1] === c) ? 2 : 1,
                        borderColor: (entrance[0] === r && entrance[1] === c)
                            ? "#4527a0"
                            : (criteria.laneType === "one-way" && exitGate[0] === r && exitGate[1] === c)
                            ? "#b39ddb"
                            : "#ccc"
                    }}
                    title={isPreview ? getCellTitle(r, c) : `${getCellTitle(r, c)}${zone ? ` (${zone})` : ''}${features.hasRoof ? ' + Roof' : ''}${features.hasEVCharger ? ' + EV' : ''}`}
                    onClick={isPreview ? (() => {
                        if (selectMode === "entrance") {
                            setEntrance([r, c]);
                            if (criteria.laneType === "two-way") {
                                setExitGate([r, c]);
                            }
                            setSelectMode(null);
                        } else if (selectMode === "exit" && criteria.laneType === "one-way") {
                            setExitGate([r, c]);
                            setSelectMode(null);
                        }
                    }) : undefined}
                >
                    {/* Feature icons - show both icons when both are selected */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '1px', 
                        flexWrap: 'wrap', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 2
                    }}>
                        {features.hasEVCharger && <span style={{ fontSize: Math.max(8, cellSize / 6) }}>⚡</span>}
                        {features.hasRoof && <span style={{ fontSize: Math.max(8, cellSize / 6) }}>🏠</span>}
                    </div>
                </div>
            </div>
        );
    }

    // Zone assignment dialog
    function ZoneDialog() {
        if (!showZoneDialog) return null;

        // Check if all selected cells have the same zone and features
        const firstCell = selectedCells[0];
        const firstCellZone = zoneMap[firstCell?.r]?.[firstCell?.c];
        const firstCellFeatures = featureMap[`${firstCell?.r}-${firstCell?.c}`] || {};
        
        const allSameZone = selectedCells.every(({ r, c }) => zoneMap[r]?.[c] === firstCellZone);
        const allSameFeatures = selectedCells.every(({ r, c }) => {
            const features = featureMap[`${r}-${c}`] || {};
            return features.hasRoof === firstCellFeatures.hasRoof && 
                   features.hasEVCharger === firstCellFeatures.hasEVCharger;
        });

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={clearSelection}>
                <div 
                    className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()} // Prevent dialog from closing when clicking inside
                >
                    <h3 className="text-lg font-bold mb-4">Assign Zone & Features</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Selected {selectedCells.length} cell(s)
                        {!allSameZone && <span className="text-orange-600"> (mixed zones)</span>}
                        {!allSameFeatures && <span className="text-orange-600"> (mixed features)</span>}
                    </p>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Zone Type:</label>
                        <select 
                            value={selectedZone} 
                            onChange={e => setSelectedZone(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="vip">VIP</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">Features:</label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedFeatures.hasRoof}
                                    onChange={e => setSelectedFeatures(prev => ({ ...prev, hasRoof: e.target.checked }))}
                                    className="mr-2"
                                />
                                🏠 Covered/Roof
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedFeatures.hasEVCharger}
                                    onChange={e => setSelectedFeatures(prev => ({ ...prev, hasEVCharger: e.target.checked }))}
                                    className="mr-2"
                                />
                                ⚡ EV Charger
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAssignZoneAndFeatures}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Apply
                        </button>
                        <button
                            onClick={clearZoneAndFeatures}
                            className="px-4 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                        >
                            Clear
                        </button>
                        <button
                            onClick={clearSelection}
                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    // Enhanced legend with zones
    function EnhancedLayoutLegendBar() {
        return (
            <div className="flex flex-col gap-3 mt-4">
                {/* Layout legend - Row 1 */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[0], border: "1px solid #ccc" }} />
                        <span className="text-sm">Empty</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[9], border: "1px solid #ccc" }} />
                        <span className="text-sm">Blocked</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[1], border: "1px solid #ccc" }} />
                        <span className="text-sm">Driveway</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[2], border: "1px solid #ccc" }} />
                        <span className="text-sm">Perpendicular</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[3], border: "1px solid #ccc" }} />
                        <span className="text-sm">Parallel</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[8], border: "1px solid #ccc" }} />
                        <span className="text-sm">Entrance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded" style={{ background: layoutColorMap[7], border: "1px solid #ccc" }} />
                        <span className="text-sm">Exit</span>
                    </div>
                </div>
                
                {/* Zone legend - Row 2 */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded border-2" style={{ borderColor: zoneColorMap.public, backgroundColor: 'transparent' }} />
                        <span className="text-sm">Public Zone</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded border-2" style={{ borderColor: zoneColorMap.private, backgroundColor: 'transparent' }} />
                        <span className="text-sm">Private Zone</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="inline-block w-5 h-5 rounded border-2" style={{ borderColor: zoneColorMap.vip, backgroundColor: 'transparent' }} />
                        <span className="text-sm">VIP Zone</span>
                    </div>
                </div>
                
                {/* Feature legend - Row 3 */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">⚡</span>
                        <span className="text-sm">EV Charger</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-lg">🏠</span>
                        <span className="text-sm">Covered</span>
                    </div>
                </div>
            </div>
        );
    }

    // Export dialog
    function ExportDialog() {
        if (!showExportDialog) return null;

        const isPDF = exportSettings.fileType === 'pdf';
        const isImage = exportSettings.fileType === 'png' || exportSettings.fileType === 'jpg';
        const isSVG = exportSettings.fileType === 'svg';

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowExportDialog(false)}>
                <div 
                    className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <h3 className="text-lg font-bold mb-4">Export Parking Layout</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">File Name:</label>
                            <input
                                type="text"
                                value={exportSettings.fileName}
                                onChange={e => setExportSettings(prev => ({ ...prev, fileName: e.target.value }))}
                                className="w-full border rounded px-3 py-2"
                                placeholder="parking-layout"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">File Type:</label>
                            <select 
                                value={exportSettings.fileType} 
                                onChange={e => setExportSettings(prev => ({ ...prev, fileType: e.target.value }))}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="svg">SVG (Vector)</option>
                                <option value="png">PNG (Image)</option>
                                <option value="jpg">JPG (Image)</option>
                                <option value="pdf">PDF (Document)</option>
                            </select>
                        </div>

                        {/* PDF-specific options */}
                        {isPDF && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Paper Size:</label>
                                    <select 
                                        value={exportSettings.paperSize} 
                                        onChange={e => setExportSettings(prev => ({ ...prev, paperSize: e.target.value }))}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="A4">A4</option>
                                        <option value="A3">A3</option>
                                        <option value="Letter">Letter</option>
                                        <option value="Legal">Legal</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Orientation:</label>
                                    <select 
                                        value={exportSettings.orientation} 
                                        onChange={e => setExportSettings(prev => ({ ...prev, orientation: e.target.value }))}
                                        className="w-full border rounded px-3 py-2"
                                    >
                                        <option value="landscape">Landscape</option>
                                        <option value="portrait">Portrait</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {/* Content options for all formats */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Include:</label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={exportSettings.includeZones}
                                        onChange={e => setExportSettings(prev => ({ ...prev, includeZones: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    Zone Colors
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={exportSettings.includeFeatures}
                                        onChange={e => setExportSettings(prev => ({ ...prev, includeFeatures: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    Feature Icons (⚡🏠)
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={exportSettings.includeLegend}
                                        onChange={e => setExportSettings(prev => ({ ...prev, includeLegend: e.target.checked }))}
                                        className="mr-2"
                                    />
                                    Legend
                                </label>
                            </div>
                        </div>

                        {/* Format-specific info */}
                        {isSVG && (
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                SVG format is scalable and perfect for printing or further editing.
                            </div>
                        )}
                        {isImage && (
                            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                {exportSettings.fileType.toUpperCase()} format creates a fixed-size image. 
                                {exportSettings.fileType === 'png' ? ' Supports transparency.' : ' White background.'}
                            </div>
                        )}
                        {isPDF && (
                            <div className="text-xs text-orange-500 bg-orange-50 p-2 rounded">
                                PDF export currently creates SVG format. For full PDF support, consider using jsPDF library.
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleExport}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Export as {exportSettings.fileType.toUpperCase()}
                        </button>
                        <button
                            onClick={() => setShowExportDialog(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Handle save layout
    const handleSaveLayout = async () => {
        // Validate that we have a layout to save
        if (resultGrid.length === 0) {
            alert('No layout to save. Please generate a layout first.');
            return;
        }

        setIsSaving(true);
        setSaveError('');
        setSaveSuccess(false);

        try {
            const saveData = {
                rows: size.rows,
                cols: size.cols,
                blocked: blocked.map(cell => [cell.r, cell.c]),
                entrance: entrance,
                exit: exitGate,
                laneType: criteria.laneType,
                layout: resultGrid,
                zoneMap: zoneMap,
                featureMap: featureMap
            };

            console.log('Saving layout data:', saveData);

            // ToDo API for saving
            const response = await fetch('/api/parking-layout/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saveData)
            });

            const responseData = await response.json();

            if (response.ok) {
                setSaveSuccess(true);
                console.log('Layout saved successfully:', responseData);
                
                // Show success message for 3 seconds
                setTimeout(() => {
                    setSaveSuccess(false);
                }, 3000);

                // Optional: Reset the form or redirect
                // setStep(1);
                // setResultGrid([]);
            } else {
                throw new Error(responseData.message || 'Failed to save layout');
            }

        } catch (error) {
            console.error('Error saving layout:', error);
            setSaveError(error.message || 'An error occurred while saving the layout');
            
            // Clear error message after 5 seconds
            setTimeout(() => {
                setSaveError('');
            }, 5000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" onClick={clearSelection}>
            {/* Toast Notifications */}
            {saveSuccess && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <span>✅</span>
                    <span>Thiết kế đã được lưu thành công!</span>
                </div>
            )}
            {saveError && (
                <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2">
                    <span>❌</span>
                    <span>{saveError}</span>
                </div>
            )}

            <Navbar />
            <div className="flex flex-1 w-full">
                <div className="w-[320px] bg-white shadow p-4 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                    <h2 className="font-bold text-lg mb-2">Parking Design Wizard</h2>
                    {step === 1 ? (
                        <>
                            <label>
                                Rows:
                                <input type="number" name="rows" min={1} max={30} value={size.rows} onChange={handleSizeChange} className="border ml-2 w-16" />
                            </label>
                            <label>
                                Columns:
                                <input type="number" name="cols" min={1} max={30} value={size.cols} onChange={handleSizeChange} className="border ml-2 w-16" />
                            </label>
                            <div className="mb-2 mt-4">Click cells to mark as blocked (red):</div>
                            <div
                                className="grid"
                                style={{
                                    gridTemplateColumns: `repeat(${size.cols}, 24px)`,
                                    gridAutoRows: "24px",
                                    gap: "2px",
                                }}
                            >
                                {grid.map((row, r) =>
                                    row.map((cell, c) => (
                                        <div
                                            key={`${r}-${c}`}
                                            className="rounded border cursor-pointer"
                                            style={{
                                                background: cell === BLOCKED ? "#b03a3a" : "#eeeeee",
                                                width: 24,
                                                height: 24,
                                            }}
                                            onClick={() => toggleBlocked(r, c)}
                                            title={cell === BLOCKED ? "Blocked" : "Empty"}
                                        />
                                    ))
                                )}
                            </div>
                            <LegendBar />
                            <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4" onClick={() => setStep(2)}>
                                Next: Advanced Criteria
                            </button>
                        </>
                    ) : (
                        <>
                            <label>
                                Lane Type:
                                <select name="laneType" value={criteria.laneType} onChange={handleCriteriaChange} className="border ml-2">
                                    <option value="two-way">Two Way</option>
                                    <option value="one-way">One Way</option>
                                </select>
                            </label>
                            <label>
                                Number of Floors:
                                <input type="number" name="floors" min={1} max={10} value={criteria.floors} onChange={handleCriteriaChange} className="border ml-2 w-16" />
                            </label>
                            <label>
                                Cell Size (px):
                                <input type="number" name="cellSize" min={16} max={64} value={criteria.cellSize} onChange={handleCriteriaChange} className="border ml-2 w-16" />
                            </label>
                            <div className="mt-4">
                                <EntranceExitButtons />
                            </div>
                            {selectMode && (
                                <div className="text-sm text-purple-700 mt-2">
                                    Click vào ô để chọn {criteria.laneType === "two-way" ? "Entrance/Exit" : selectMode === "entrance" ? "Entrance" : "Exit"}
                                </div>
                            )}
                            <div className="mt-4 font-mono text-sm">
                                Entrance: [{entrance[0]}, {entrance[1]}] <br />
                                Exit: [{exitGate[0]}, {exitGate[1]}]
                            </div>
                            <div
                                className="grid mt-4"
                                style={{
                                    gridTemplateColumns: `repeat(${size.cols}, 24px)`,
                                    gridAutoRows: "24px",
                                    gap: "2px",
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                {grid.map((row, r) =>
                                    row.map((cell, c) => (
                                        <GridCell 
                                            key={`${r}-${c}`}
                                            r={r} 
                                            c={c} 
                                            cell={getCellType(r, c)} 
                                            cellSize={24} 
                                            isPreview={true}
                                        />
                                    ))
                                )}
                            </div>
                            <LayoutLegendBar />
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded mt-6"
                                onClick={handleGenerateLayout}
                                disabled={loading}
                            >
                                {loading ? "Generating..." : "Generate Layout"}
                            </button>
                            {resultGrid.length > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded">
                                    <div className="text-sm font-medium text-blue-800 mb-2">Advanced Design:</div>
                                    <div className="text-xs text-blue-600">
                                        • Drag to select multiple cells<br/>
                                        • Assign zones and features<br/>
                                        • Click outside to clear selection
                                    </div>
                                </div>
                            )}
                            <button className="text-gray-500 mt-2" onClick={() => setStep(1)}>
                                Back
                            </button>
                        </>
                    )}
                </div>
                {/* Right panel: Preview and Generate */}
                <div className="flex-1 flex flex-col items-center py-8" onClick={e => e.stopPropagation()}>
                    {step === 1 ? (
                        <>
                            <div className="font-bold mb-2">Blocked Cells Preview</div>
                            <div
                                className="grid"
                                style={{
                                    gridTemplateColumns: `repeat(${size.cols}, 24px)`,
                                    gridAutoRows: "24px",
                                    gap: "2px",
                                }}
                            >
                                {grid.map((row, r) =>
                                    row.map((cell, c) => (
                                        <div
                                            key={`${r}-${c}`}
                                            className="rounded border"
                                            style={{
                                                background: cell === BLOCKED ? "#b03a3a" : "#eeeeee",
                                                width: 24,
                                                height: 24,
                                            }}
                                        />
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-2 w-full max-w-4xl">
                                <div className="font-bold">
                                    Generated Parking Layout Preview
                                    {selectedCells.length > 0 && (
                                        <span className="ml-2 text-sm font-normal text-blue-600">
                                            ({selectedCells.length} cells selected)
                                        </span>
                                    )}
                                </div>
                                {resultGrid.length > 0 && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSaveLayout}
                                            disabled={isSaving}
                                            className={`px-4 py-2 rounded flex items-center gap-2 ${
                                                isSaving 
                                                    ? 'bg-gray-400 cursor-not-allowed' 
                                                    : 'bg-green-600 hover:bg-green-700'
                                            } text-white`}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="animate-spin">⏳</span>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <span>💾</span>
                                                    Save Design
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setShowExportDialog(true)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <span>📥</span>
                                            Export
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div
                                className="grid select-none"
                                style={{
                                    gridTemplateColumns: `repeat(${size.cols}, ${criteria.cellSize}px)`,
                                    gridAutoRows: `${criteria.cellSize}px`,
                                    gap: "2px",
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                {resultGrid.length > 0 ? (
                                    resultGrid.map((row, r) =>
                                        row.map((cell, c) => (
                                            <GridCell 
                                                key={`${r}-${c}`}
                                                r={r} 
                                                c={c} 
                                                cell={cell} 
                                                cellSize={criteria.cellSize}
                                            />
                                        ))
                                    )
                                ) : (
                                    <div className="text-gray-400 mt-8">No layout generated yet.</div>
                                )}
                            </div>
                            {resultGrid.length > 0 ? <EnhancedLayoutLegendBar /> : <LayoutLegendBar />}
                        </>
                    )}
                </div>
            </div>
            <Footer />
            <ZoneDialog />
            <ExportDialog />
        </div>
    );
}