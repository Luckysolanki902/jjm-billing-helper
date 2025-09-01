
"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Snackbar from "@mui/material/Snackbar";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import schemes from "@/lib/schemes";



function copyToClipboard(text, setSnackbar) {
  if (navigator && navigator.clipboard) {
    navigator.clipboard.writeText(text);
    setSnackbar(true);
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
  const [snackbar, setSnackbar] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);

  function handleEnterSelect(e) {
    if (e.key !== "Enter") return;
    // If already selected, let Autocomplete handle it.
    if (selected) return;
    const q = inputValue.trim().toLowerCase();
    if (!q) return;
    // Find first suggestion that includes the input (case-insensitive)
    const first = schemes.find((s) => s.schemeName.toLowerCase().includes(q));
    if (first) {
      e.preventDefault();
  setSelected(first);
  // close suggestions so dialog is not shown after pressing Enter
  setOpen(false);
    }
  }

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
        <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, maxWidth: 540, width: "100%", borderRadius: 4, boxShadow: 8, background: "#232837", border: "1px solid #232837" }}>
          <Typography variant="h5" fontWeight={800} mb={2} align="center" color="primary.main" letterSpacing={2}>
            <span style={{fontWeight:900, fontSize:32, color:'#90caf9'}}>Scheme Finder</span>
          </Typography>
          <Autocomplete
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            openOnFocus={false}
            options={schemes}
            getOptionLabel={(option) => option.schemeName || ""}
            inputValue={inputValue}
            onInputChange={(_, v, reason) => {
              setInputValue(v);
              // open popup only when user types (not when programmatically set)
              if (reason === 'input') setOpen(Boolean(v && v.length));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Search Scheme Name" variant="outlined" fullWidth autoFocus InputLabelProps={{ style: { color: '#b0b8c1' } }} onKeyDown={handleEnterSelect} />
            )}
            onChange={(_, value) => { setSelected(value); setInputValue(value ? value.schemeName : ""); setOpen(false); }}
            isOptionEqualToValue={(opt, val) => opt.schemeId === val.schemeId}
            sx={{ mb: 2, bgcolor: "#232837", borderRadius: 2, boxShadow: 2 }}
            popupIcon={<ContentCopyIcon sx={{ color: '#90caf9' }} />}
          />
          {selected && (
            <Box mt={2}>
              <InfoRow label="Scheme Name" value={selected.schemeName} setSnackbar={setSnackbar} />
              <InfoRow label="Scheme ID" value={selected.schemeId} setSnackbar={setSnackbar} />
              <InfoRow label="LOA Number" value={selected.loa} setSnackbar={setSnackbar} />
              <InfoRow label="Block" value={selected.block} setSnackbar={setSnackbar} />
              <InfoRow label="JE Name" value={selected.je} setSnackbar={setSnackbar} />
            </Box>
          )}
        </Paper>
        <Snackbar
          open={snackbar}
          autoHideDuration={1500}
          onClose={() => setSnackbar(false)}
          message="Copied!"
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          ContentProps={{ sx: { bgcolor: '#232837', color: '#90caf9', fontWeight: 700, fontSize: 18 } }}
        />
      </Box>
    </ThemeProvider>
  );
}


function InfoRow({ label, value, setSnackbar }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "#232837",
        borderRadius: 2,
        px: 2,
        py: 1.2,
        mb: 1.2,
        boxShadow: 2,
        border: '1px solid #232837',
        transition: 'background 0.2s',
        '&:hover': { bgcolor: '#282c38' },
      }}
    >
      <Typography variant="body2" fontWeight={700} color="primary.main" sx={{ letterSpacing: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2" sx={{ mr: 1, wordBreak: "break-all", color: '#b0b8c1', fontWeight: 600 }}>
          {value}
        </Typography>
        <IconButton size="small" onClick={() => copyToClipboard(value, setSnackbar)} sx={{ color: '#90caf9' }}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
