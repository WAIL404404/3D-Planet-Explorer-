
import React, { useRef, useEffect, useState } from 'react';
import type { Country, FeatureCollection } from '../types';
import * as d3 from 'd3';

declare const topojson: any;

interface GlobeProps {
  onCountryClick: (country: Country | null) => void;
  selectedCountry: Country | null;
}

const Globe: React.FC<GlobeProps> = ({ onCountryClick, selectedCountry }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [worldData, setWorldData] = useState<FeatureCollection | null>(null);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(response => response.json())
      .then(data => {
        const countries = topojson.feature(data, data.objects.countries);
        setWorldData(countries as FeatureCollection);
      });
  }, []);

  useEffect(() => {
    if (!worldData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    const width = 800;
    const height = 800;
    canvas.width = width;
    canvas.height = height;

    const projection = d3.geoOrthographic()
      .scale(width / 2 - 20)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    const path = d3.geoPath(projection, context);

    let countries = worldData.features;
    let selected: Country | null = null;
    let autorotate: any;

    const water = { type: 'Sphere' };
    const graticule = d3.geoGraticule10();

    const render = (rotation: [number, number], scale: number) => {
      projection.rotate(rotation).scale(scale);
      context.clearRect(0, 0, width, height);
      
      // Globe fill
      context.fillStyle = '#0f172a';
      context.beginPath();
      path(water);
      context.fill();
      
      // Graticules
      context.strokeStyle = 'rgba(100, 116, 139, 0.5)';
      context.lineWidth = 0.5;
      context.beginPath();
      path(graticule);
      context.stroke();
      
      // Countries
      context.fillStyle = '#475569';
      context.strokeStyle = '#94a3b8';
      context.lineWidth = 0.7;
      context.beginPath();
      path({type: "FeatureCollection", features: countries});
      context.fill();
      context.stroke();

      // Selected country
      if (selected) {
        context.fillStyle = '#38bdf8';
        context.strokeStyle = '#e0f2fe';
        context.lineWidth = 1.5;
        context.beginPath();
        path(selected);
        context.fill();
        context.stroke();
      }
    };

    const drag = d3.drag()
        .on('start', (event) => {
            if (autorotate) autorotate.stop();
        })
        .on('drag', (event) => {
            const rotate = projection.rotate();
            const k = 75 / projection.scale();
            projection.rotate([
                rotate[0] + event.dx * k,
                rotate[1] - event.dy * k
            ]);
            render(projection.rotate(), projection.scale());
        })
        .on('end', (event) => {
            // Optional: resume autorotation
        });

    d3.select(canvas).call(drag as any);

    const findCountry = (event: MouseEvent) => {
        const pos = d3.pointer(event);
        const [lon, lat] = projection.invert(pos) || [0, 0];
        return countries.find(c => d3.geoContains(c, [lon, lat]));
    }

    d3.select(canvas).on('mousemove', (event) => {
        const country = findCountry(event);
        canvas.style.cursor = country ? 'pointer' : 'grab';
    });

    d3.select(canvas).on('click', (event) => {
        const country = findCountry(event);
        onCountryClick(country || null);
    });

    // Initial and update render
    let currentRotation = projection.rotate();
    let currentScale = projection.scale();
    render(currentRotation, currentScale);

    // Zoom/pan to selected country
    if (selectedCountry) {
        selected = selectedCountry;
        const centroid = d3.geoCentroid(selectedCountry);
        d3.transition()
            .duration(1250)
            .tween('rotate', () => {
                const r = d3.interpolate(projection.rotate(), [-centroid[0], -centroid[1]]);
                const s = d3.interpolate(projection.scale(), width / 2 - 20 * 2.5);
                return (t) => {
                    render(r(t), s(t));
                };
            });
    } else {
        selected = null;
        if(autorotate) autorotate.stop();
        // Zoom out and start autorotating
        d3.transition()
            .duration(1250)
            .tween('rotate', () => {
                const r = d3.interpolate(projection.rotate(), [0, 0]);
                const s = d3.interpolate(projection.scale(), width / 2 - 20);
                return (t) => {
                    render(r(t), s(t));
                    if (t === 1) { // After transition finishes
                         autorotate = d3.timer(function(elapsed) {
                            const rotate = projection.rotate();
                            const k = 0.02; // speed
                            projection.rotate([rotate[0] + k, rotate[1]]);
                            render(projection.rotate(), projection.scale());
                        });
                    }
                };
            });
    }

    return () => {
        // Cleanup: remove listeners and timers
        d3.select(canvas).on('.drag', null);
        d3.select(canvas).on('click', null);
        d3.select(canvas).on('mousemove', null);
        if (autorotate) autorotate.stop();
    };

  }, [worldData, selectedCountry, onCountryClick]);

  return <canvas ref={canvasRef} className="max-w-full max-h-full rounded-full globe-glow" />;
};

export default Globe;
