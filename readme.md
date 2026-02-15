# Lab 6: Smart Dashboard
**Student:** Rishi Victor

## 1. Project Description
This dashboard visualizes the 2023 visitor statistics and geographical distribution of major US National Parks using an interactive Mapbox interface and synchronized D3/C3 charts.

## 2. Map Type Justification
**Selected Map Type:** Proportional Symbol Map.

**Why this type?**
I selected a Proportional Symbol map because the primary variable, **Total Visitors**, represents a quantitative magnitude associated with specific point locations (the parks). 
* A **Choropleth map** was rejected because parks are discrete points, not continuous administrative regions like counties or states.
* The varying size of the circles allows viewers to immediately perceive differences in visitor volume (e.g., Great Smoky Mountains vs. Acadia) while maintaining accurate geographic positioning.

## 3. Data Visualization Components
In addition to the map, the dashboard includes:
1.  **Total Visitors Counter:** A dynamic aggregation of all visible data points.
2.  **Donut Chart:** Visualizes the categorical distribution of parks by Region (West, Southwest, etc.).
3.  **Bar Chart:** Compares the physical size (Acres) of each park.

## 4. Libraries Used
* Mapbox GL JS
* C3.js (Charts)
* D3.js (Data manipulation)

## 5. Deployment
* **GitHub Repository:** [(https://rta2810.github.io/geog458-lab6/)]
