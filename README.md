# Watts–Strogatz Small-World Model: Simulation and Analysis

This repository implements and analyzes the **Watts–Strogatz model** for small-world networks — a cornerstone in modern network science demonstrating how a small amount of randomness in a regular lattice leads to networks that are both highly clustered and globally well connected.

<p align="center">
  <img src="figures/network_vis_p_0_02.png" width="65%" alt="Watts–Strogatz small-world visualization">
</p>

---

## 🔬 Overview

The Watts–Strogatz model describes a continuous transition between order and randomness in network topology.  
Starting from a regular ring lattice, each edge is rewired with probability *p*, producing:

- **High clustering** at low *p* (locally ordered)
- **Short average path lengths** at higher *p* (globally random)
- **A “small-world” regime** at intermediate *p*, where both coexist

This project numerically simulates that transition and measures canonical network metrics:
- Degree distributions  
- Local and global clustering coefficients  
- Approximate average shortest path length ⟨L⟩  

---

## 🧩 Model and Methodology

### 1. Ring Lattice Construction
- \( n \) = 1000 nodes arranged in a ring  
- Each node connected to \( k = 10 \) nearest neighbors  
- Regular degree distribution with high local clustering

### 2. Rewiring
- Each edge is rewired with probability *p*, ensuring no self-loops or duplicate edges.  
- Rewiring probability sweep: \( p \in [0, 1] \) (logarithmic spacing at small *p*).  
- Five realizations per *p* to estimate mean and variance.

### 3. Measured Quantities
- **Clustering coefficient (C)**  
  \[
  C_i = \frac{2T_i}{k_i(k_i-1)}, \quad C=\frac{1}{n}\sum_i C_i
  \]
- **Average shortest path length (⟨L⟩)**  
  Estimated by Breadth-First Search from 100 randomly selected nodes per realization.
- **Degree distribution (P(k))** for visual comparison across *p*.

---

## 📈 Results

| p |  ⟨C⟩ | ⟨L⟩ | Regime |
|:--:|:--:|:--:|:--|
| 0 | 0.67 | 50.4 | Ordered lattice |
| 10⁻³ | 0.66 | 17.9 | Small-world onset |
| 10⁻² | 0.64 | 8.3 | Small-world regime |
| 1 | 0.01 | 3.27 | Random graph |

<p align="center">
  <img src="docs/clustering_vs_p.png" width="45%" alt="Clustering vs p">
  <img src="docs/apl_vs_p.png" width="45%" alt="Average path length vs p">
</p>

At small nonzero *p*, ⟨L⟩ decreases rapidly while *C* remains high — the hallmark of small-world behavior.

---

## 🧠 Discussion

- **Small-world mechanism:**  
  Sparse long-range “shortcuts” collapse global distances without disrupting local clustering.  
- **Applications:**  
  Observed in social, neuronal, transport, and information networks.  
- **Limitations:**  
  - Finite-size effects (\( n=1000 \))  
  - BFS sampling approximations  
  - Homogeneous degree sequence (no hubs or communities)

---

## ⚙️ Reproducibility

All parameters are defined at the top of the notebook.  
Random seeds ensure reproducible figures, while independent seeds across realizations measure variability.  
To refine accuracy, increase the number of realizations R or BFS samples S.

**Baseline simulation settings:**
```
n = 1000
k = 10
p ∈ [0, 1]
R = 5
S = 100
```

---

## 🧩 Repository Structure

```
Watts-Strogatz/
├── watts_strogatz.ipynb      # Main notebook: simulations, plots, analysis
├── data/                     # Optional saved outputs
├── docs/                     # Figures used in report and README
│   ├── clustering_vs_p.png
│   ├── apl_vs_p.png
│   ├── network_vis_p_0_01.png
│   └── ...
└── report/                   # LaTeX source and compiled PDF
```

---

## 📚 Citation

If you use this repository, please cite the original work:

> Watts, D. J. & Strogatz, S. H. (1998).  
> *Collective dynamics of “small-world” networks.*  
> *Nature*, 393(6684), 440–442.  
> [https://doi.org/10.1038/30918](https://doi.org/10.1038/30918)

---

## 👤 Author

**Amit Kemelmakher**  
Bar-Ilan University, Department of Physics  
Email: [amit.kmlr@gmail.com](mailto:amit.kmlr@gmail.com)
