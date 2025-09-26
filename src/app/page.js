
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CssBaseline from "@mui/material/CssBaseline";
import Chip from "@mui/material/Chip";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import schemes from "@/lib/schemes";
// Static date mapping + helper (outside component to avoid hook dependency issues)
const DATE_MAPPING = {
  "1016": "26.09.2023",
  "1027": "10.10.2023",
  "1054": "15.01.2024",
  "1068": "01.03.2024"
};

function getDateFromLoa(loa) {
  if (!loa) return "";
  const prefix = loa.toString().substring(0, 4);
  return DATE_MAPPING[prefix] || "";
}



function copyToClipboard(text) {
  if (navigator && navigator.clipboard && typeof text !== 'undefined') {
    navigator.clipboard.writeText(String(text));
  }
}


const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    background: {
      default: "#181c24",
      paper: "#232837",
    },
    text: {
      primary: "#fff",
      secondary: "#b0b8c1",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Inter, Roboto, "Helvetica Neue", Arial, sans-serif',
    h5: {
      fontWeight: 800,
      letterSpacing: 1.2,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          background: "#232837",
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default function Home() {
  const [selected, setSelected] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [lastCopiedKey, setLastCopiedKey] = useState(null);
  const [rowFocusIndex, setRowFocusIndex] = useState(0); // for navigating rows when unfocused
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const [inputHeight, setInputHeight] = useState(0);

  // autofocus on mount
  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, []);

  // Measure input height to anchor dropdown precisely (avoids mid-overlay)
  useEffect(() => {
    function measure() {
      if (inputWrapperRef.current) {
        const h = inputWrapperRef.current.getBoundingClientRect().height;
        if (h && h !== inputHeight) setInputHeight(h);
      }
    }
    measure();
    window.addEventListener('resize', measure);
    // also measure right after paint when value changes (label shrink affects height)
    const id = requestAnimationFrame(measure);
    return () => { window.removeEventListener('resize', measure); cancelAnimationFrame(id); };
  }, [inputValue, inputFocused, inputHeight]);

  // Derived filtered suggestions
  const filtered = React.useMemo(() => (
    inputValue
      ? schemes.filter(s => s.schemeName.toLowerCase().includes(inputValue.toLowerCase()))
      : []
  ), [inputValue]);

  useEffect(() => {
    // Only show when focused and there are matches
    setShowSuggestions(inputFocused && Boolean(filtered.length));
  }, [filtered.length, inputFocused]);

  // Helper to select first suggestion
  const selectFirst = useCallback(() => {
    if (filtered.length) {
      setSelected(filtered[0]);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }, [filtered]);

  // Keyboard inside input
  function handleInputKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      selectFirst();
    } else if (e.key === 'ArrowDown') {
      // allow quick selection preview? Cycle suggestions visually
      e.preventDefault();
      // optional: could implement cycling; keeping simple focusing first
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  }

  // Global shortcuts when NOT focusing input
  const handleCopyByKey = useCallback((key) => {
    if (!selected) return;
    const value = key === 'date' ? getDateFromLoa(selected.loa) : selected[key];
    copyToClipboard(value);
    setLastCopiedKey(key);
    setTimeout(() => setLastCopiedKey(null), 900);
  }, [selected]);

  useEffect(() => {
    function onKey(e) {
      if (document.activeElement === inputRef.current) return; // ignore shortcuts while typing
      const k = e.key.toLowerCase();
      // Arrow navigation among rows (only if selection exists)
      const rowKeys = ['schemeName','block','schemeId','loa','date','je'];
      if (['arrowdown','arrowup'].includes(k) && selected) {
        e.preventDefault();
        setRowFocusIndex(i => {
          const max = rowKeys.length - 1;
          if (k === 'arrowdown') return i >= max ? 0 : i + 1;
          return i <= 0 ? max : i - 1;
        });
        return;
      }
      if (k === 'enter') {
        e.preventDefault();
        if (!selected) {
          // if no selection yet but we have suggestions from existing text value
          selectFirst();
        } else {
          // copy currently focused row
          const focusKey = rowKeys[rowFocusIndex];
            handleCopyByKey(focusKey);
        }
        return;
      }
      if (k === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
        return;
      }
      if (k === 'c') {
        e.preventDefault();
        setSelected(null);
        setInputValue("");
        requestAnimationFrame(() => inputRef.current?.focus());
        return;
      }
      if (!selected) return; // below shortcuts need data
      const map = {
        's': 'schemeName',
        'b': 'block',
        'i': 'schemeId',
        'l': 'loa',
        'd': 'date',
        'j': 'je'
      };
      if (map[k]) {
        e.preventDefault();
        handleCopyByKey(map[k]);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectFirst, selected, rowFocusIndex, handleCopyByKey]);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(e) {
      if (!showSuggestions) return;
      const inputEl = inputRef.current;
      const listEl = suggestionsRef.current;
      if (inputEl && inputEl.contains(e.target)) return;
      if (listEl && listEl.contains(e.target)) return;
      setShowSuggestions(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  // (date mapping helper is declared at module scope)

  // Row data config
  const rows = selected ? [
    { label: 'Scheme Name', key: 'schemeName', shortcut: 'S', value: selected.schemeName },
    { label: 'Block', key: 'block', shortcut: 'B', value: selected.block },
    { label: 'Scheme ID', key: 'schemeId', shortcut: 'I', value: selected.schemeId },
    { label: 'LOA Number', key: 'loa', shortcut: 'L', value: selected.loa },
    { label: 'C.A. Date', key: 'date', shortcut: 'D', value: getDateFromLoa(selected.loa) },
    { label: 'JE Name', key: 'je', shortcut: 'J', value: selected.je },
  ] : [];

  useEffect(() => { if (rows.length) setRowFocusIndex(0); }, [rows.length]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper component="form" onSubmit={e => { e.preventDefault(); selectFirst(); }} elevation={6} sx={{ p: { xs: 2, sm: 4 }, maxWidth: 600, width: "100%", borderRadius: 4, boxShadow: 8, background: "#232837", border: "1px solid #2d3444", position:'relative' }}>
          <Typography variant="h5" fontWeight={800} mb={2} align="center" color="primary.main" letterSpacing={2}>
            <span style={{fontWeight:900, fontSize:32, color:'#90caf9'}}>Scheme Finder</span>
          </Typography>
          <Box sx={{ position:'relative', mb: 1.5 }}>
            <Box ref={inputWrapperRef} sx={{ position:'relative' }}>
            <TextField
              label="Search Scheme Name"
              variant="outlined"
              fullWidth
              value={inputValue}
              inputRef={inputRef}
              onFocus={() => { setInputFocused(true); setShowSuggestions(Boolean(filtered.length)); }}
              onBlur={() => { setInputFocused(false); /* outside click handler will close */ }}
              onChange={e => { setInputValue(e.target.value); setSelected(null); setShowSuggestions(Boolean(e.target.value)); }}
              onKeyDown={handleInputKeyDown}
              InputLabelProps={{ style: { color: '#b0b8c1' } }}
              InputProps={{
                endAdornment: (
                  (inputValue || selected) && (
                    <IconButton
                      size="small"
                      aria-label="Clear"
                      onMouseDown={(e) => { e.preventDefault(); }}
                      onClick={() => { setInputValue(""); setSelected(null); setShowSuggestions(false); requestAnimationFrame(()=> inputRef.current?.focus()); }}
                      sx={{ color:'#90caf9', mr:0.5 }}
                    >
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  )
                )
              }}
            />
            </Box>
            <AnimatePresence>
              {showSuggestions && inputHeight > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity:0, y:-4 }}
                  animate={{ opacity:1, y:0 }}
                  exit={{ opacity:0, y:-4 }}
                  style={{ position:'absolute', left:0, right:0, top: inputHeight + 6, zIndex:15 }}
                >
                  <Paper sx={{ maxHeight: 320, overflowY:'auto', background:'#1f2430', border:'1px solid #2d3444', borderRadius: 2, boxShadow: '0 10px 28px -4px rgba(0,0,0,0.55)' }}>
                    {filtered.slice(0, 50).map((s, idx) => (
                      <Box
                        key={s.schemeId}
                        onMouseDown={e => { e.preventDefault(); }}
                        onClick={() => { setSelected(s); setShowSuggestions(false); inputRef.current?.blur(); }}
                        sx={{
                          px: 1.4, py: 1,
                          cursor:'pointer',
                          fontSize:14,
                          display:'flex',
                          alignItems:'center',
                          gap:1,
                          borderBottom: idx === filtered.length-1 ? 'none':'1px solid #2d3444',
                          background: idx===0 ? 'linear-gradient(90deg,#2a3141,#232837)' : 'transparent',
                          '&:hover': { background:'#2a3141' }
                        }}
                      >
                        <Typography variant="body2" sx={{ flex:1 }}>{s.schemeName}</Typography>
                        <Chip size="small" label={s.block} sx={{ bgcolor:'#2f3a4e', color:'#90caf9' }} />
                      </Box>
                    ))}
                    {!filtered.length && (
                      <Box px={1.5} py={1}>
                        <Typography variant="caption" sx={{ color:'#647082' }}>No matches</Typography>
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>

          {selected && (
            <Box mt={2.5}>
              {rows.map((r, idx) => (
                <InfoRow
                  key={r.key}
                  label={r.label}
                  value={r.value}
                  shortcut={r.shortcut}
                  active={rowFocusIndex === idx}
                  copied={lastCopiedKey === r.key}
                  onCopy={() => handleCopyByKey(r.key)}
                />
              ))}
              <Box mt={2} display="flex" gap={1} flexWrap="wrap" justifyContent="flex-end">
                <Chip variant="outlined" size="small" label="C = Clear & Focus" sx={{ bgcolor:'#1f2430', color:'#90caf9', borderColor:'#2d3444', fontWeight:600 }} />
                <Chip variant="outlined" size="small" label="F = Focus Search" sx={{ bgcolor:'#1f2430', color:'#90caf9', borderColor:'#2d3444', fontWeight:600 }} />
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
}
function InfoRow({ label, value, shortcut, onCopy, copied, active }) {
  return (
    <motion.div
      layout
      initial={false}
      animate={{
        backgroundColor: copied ? '#2f3a4e' : active ? '#2a3141' : '#232837',
        scale: copied ? 1.01 : 1,
      }}
      transition={{ type:'spring', stiffness: 260, damping: 24 }}
      style={{
        borderRadius: 12,
        marginBottom: 12,
        border: '1px solid #2d3444',
        boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        display:'flex',
        alignItems:'center',
        padding: '14px 16px',
        justifyContent:'space-between',
        cursor:'pointer'
      }}
      onClick={onCopy}
    >
      <Box sx={{ display:'flex', alignItems:'center', gap:1.2 }}>
        <Chip label={shortcut} size="small" sx={{ bgcolor:'#1f2430', color:'#90caf9', fontWeight:700 }} />
        <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1 }}>
          {label}
        </Typography>
      </Box>
      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
        <Typography variant="body2" sx={{ wordBreak:'break-all', color:'#b0b8c1', fontWeight:600, maxWidth:280 }}>
          {value}
        </Typography>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onCopy(); }} sx={{ color: copied ? '#fff' : '#90caf9', background: copied ? '#394456' : 'transparent', '&:hover': { background:'#2f3a4e' } }}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Box>
    </motion.div>
  );
}
