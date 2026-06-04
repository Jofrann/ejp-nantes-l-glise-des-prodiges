import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Users, MapPin } from 'lucide-react';

// Globe 3D avec points FIJ
function FIJGlobe({ fijs }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(0, 0, 2.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Globe
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x0a0a12,
      emissive: 0x0d1a33,
      shininess: 40,
      wireframe: false,
    });
    const globe = new THREE.Mesh(geo, mat);
    scene.add(globe);

    // Wireframe léger
    const wGeo = new THREE.SphereGeometry(1.002, 28, 28);
    const wMat = new THREE.MeshBasicMaterial({ color: 0x1a2a4a, wireframe: true, opacity: 0.15, transparent: true });
    scene.add(new THREE.Mesh(wGeo, wMat));

    // Lumières
    scene.add(new THREE.AmbientLight(0x334466, 1.2));
    const sun = new THREE.DirectionalLight(0x8899ff, 2);
    sun.position.set(3, 2, 3);
    scene.add(sun);
    const gold = new THREE.PointLight(0xC8A96A, 1.5, 10);
    gold.position.set(-2, 1, 2);
    scene.add(gold);

    // Conversion lat/lng → position 3D
    const latLngTo3D = (lat, lng, r = 1.02) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    };

    // Points pour chaque FIJ
    fijs.forEach(fij => {
      if (!fij.lat || !fij.lng) return;
      const pos = latLngTo3D(fij.lat, fij.lng);
      const isNantes = fij.is_nantes;

      // Point principal
      const dotGeo = new THREE.SphereGeometry(isNantes ? 0.022 : 0.015, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: isNantes ? 0xC8A96A : 0x6699ff });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.copy(pos);
      scene.add(dot);

      // Halo pulsant (ring)
      const ringGeo = new THREE.RingGeometry(0.025, 0.035, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isNantes ? 0xC8A96A : 0x6699ff,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos);
      ring.lookAt(0, 0, 0);
      scene.add(ring);
    });

    // Rotation auto + drag
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotY = 0.3, rotX = 0.1;
    let velY = 0.002;

    const onMouseDown = (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotY += dx * 0.005;
      rotX += dy * 0.005;
      rotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, rotX));
      velY = dx * 0.003;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onTouchStart = (e) => { isDragging = true; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
    const onTouchMove = (e) => {
      if (!isDragging) return;
      const dx = e.touches[0].clientX - prevMouse.x;
      rotY += dx * 0.005;
      velY = dx * 0.003;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('touchstart', onTouchStart);
    renderer.domElement.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onMouseUp);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      if (!isDragging) { rotY += velY; velY *= 0.97; velY += 0.0005; }
      globe.rotation.y = rotY;
      globe.rotation.x = rotX;
      scene.children.forEach(obj => {
        if (obj !== globe && obj.isMesh) {
          obj.rotation.y = rotY;
          obj.rotation.x = rotX;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('touchstart', onTouchStart);
      renderer.domElement.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [fijs]);

  return <div ref={mountRef} className="w-full h-full" />;
}

export default function FIJSection({ fijs = [] }) {
  const nantesfiJs = fijs.filter(f => f.is_nantes && f.is_active);
  const total = fijs.filter(f => f.is_active).length;

  // FIJ par défaut si aucune en base
  const displayFiJs = fijs.length > 0 ? fijs : [
    { id: '1', name: 'FIJ Nantes Centre', city: 'Nantes', lat: 47.2184, lng: -1.5536, is_nantes: true, is_active: true, leader_name: '—', member_count: 0 },
  ];

  return (
    <section id="fij" className="py-36 px-6 bg-zinc-950/70 backdrop-blur-md border-y border-white/5">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A] font-medium block mb-4">Réseau</span>
          <h2 className="font-display text-4xl md:text-5xl text-white font-light mb-5 leading-tight">
            Familles d'Impact Jeune
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Des cellules vivantes réparties en France et dans le monde. Rejoins une FIJ près de chez toi ou découvre la nôtre.
          </p>
        </motion.div>

        {/* Compteurs */}
        <div className="flex justify-center gap-12 mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="font-display text-5xl text-[#C8A96A] font-light">{total || '?'}</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 mt-1">FIJ dans le réseau</p>
          </motion.div>
          <div className="w-px bg-white/10" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <p className="font-display text-5xl text-[#C8A96A] font-light">{nantesfiJs.length || 1}</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-600 mt-1">FIJ à Nantes</p>
          </motion.div>
        </div>

        {/* Globe + Liste */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full aspect-square max-w-md mx-auto"
          >
            <FIJGlobe fijs={displayFiJs} />
          </motion.div>

          {/* Liste FIJ Nantes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="text-white font-semibold mb-1">FIJ de Nantes</h3>
            <p className="text-xs text-gray-600 mb-6 uppercase tracking-widest">Familles locales</p>
            <div className="space-y-3">
              {(nantesfiJs.length > 0 ? nantesfiJs : displayFiJs.filter(f => f.is_nantes)).map((fij, i) => (
                <motion.div
                  key={fij.id || i}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-start gap-4 bg-white/3 border border-white/8 rounded-2xl p-4 hover:border-[#C8A96A]/30 transition-colors"
                >
                  {fij.photo_url ? (
                    <img src={fij.photo_url} alt={fij.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#C8A96A]/10 border border-[#C8A96A]/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-[#C8A96A]/60" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{fij.name}</p>
                    <div className="flex items-center gap-1 mt-0.5 mb-1">
                      <MapPin className="w-3 h-3 text-gray-600" />
                      <p className="text-xs text-gray-500">{fij.city}</p>
                    </div>
                    {fij.leader_name && (
                      <p className="text-xs text-gray-600">Responsable : {fij.leader_name}</p>
                    )}
                  </div>
                  {fij.member_count > 0 && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-[#C8A96A] font-semibold text-sm">{fij.member_count}</p>
                      <p className="text-[10px] text-gray-700">membres</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-gray-700 mt-6 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C8A96A]" /> Points dorés = FIJ Nantes
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 ml-3" /> Points bleus = autres villes
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}