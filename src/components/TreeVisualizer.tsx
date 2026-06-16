import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';

interface TreeVisualizerProps {
  data: any;
  currentNodeId: string | null;
  pathStack: string[];
  formState: Record<string, string>;
}

export default function TreeVisualizer({ data, currentNodeId, pathStack, formState }: TreeVisualizerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer?: THREE.WebGLRenderer;
    labelRenderer?: any;
    scene?: THREE.Scene;
    camera?: THREE.PerspectiveCamera;
    controls?: any;
    frameId?: number;
    nodeGroupMap?: Map<string, THREE.Group>;
    nodePositions?: Map<string, THREE.Vector3>;
    wireGroup?: THREE.Group;
    transitionActive?: boolean;
    transitionStart?: number;
    transitionFrom?: { camPos: THREE.Vector3; target: THREE.Vector3 };
    transitionTo?: THREE.Vector3;
    labelDivs?: Map<string, HTMLDivElement>;      // nodeId → CSS2D div
    incomingLabels?: Map<string, string>;          // nodeId → user-facing option label
  }>({});

  const [showUser, setShowUser] = useState(false);

  // Mount Three.js scene once
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth || window.innerWidth;
    const H = mount.clientHeight || window.innerHeight;
    const s = stateRef.current;

    // --- Scene ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b1a);
    scene.fog = new THREE.FogExp2(0x050b1a, 0.008);
    s.scene = scene;

    // --- Camera ---
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.set(9, 7, 14);
    s.camera = camera;

    // --- WebGL Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    mount.appendChild(renderer.domElement);
    s.renderer = renderer;

    // --- CSS2D Renderer (for labels) ---
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(W, H);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    mount.appendChild(labelRenderer.domElement);
    s.labelRenderer = labelRenderer;

    // --- Orbit Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.9;
    controls.target.set(0, 0, 0);
    s.controls = controls;

    // Unlit scene, no lights needed (saves GPU and CPU)

    // Wire group (rebuilt when data changes)
    const wireGroup = new THREE.Group();
    scene.add(wireGroup);
    s.wireGroup = wireGroup;

    s.nodeGroupMap = new Map();
    s.nodePositions = new Map();
    s.labelDivs = new Map();
    s.incomingLabels = new Map();

    // --- ResizeObserver: reacts to divider moves AND window resize ---
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth, h = mount.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    });
    ro.observe(mount);

    // --- Animation loop ---
    const TRANSITION_DURATION = 500;
    const animate = () => {
      s.frameId = requestAnimationFrame(animate);

      // Camera transition
      if (s.transitionActive && s.transitionFrom && s.transitionTo) {
        const t = Math.min(1, (performance.now() - s.transitionStart!) / TRANSITION_DURATION);
        const ease = 1 - Math.pow(1 - t, 3);
        controls.target.lerpVectors(s.transitionFrom.target, s.transitionTo, ease);
        const offset = s.transitionFrom.camPos.clone().sub(s.transitionFrom.target);
        camera.position.copy(s.transitionTo.clone().add(offset).lerp(
          s.transitionFrom.camPos.clone().lerp(s.transitionTo.clone().add(offset), ease),
          ease
        ));
        if (t >= 1) s.transitionActive = false;
      }

      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(s.frameId!);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      if (mount.contains(labelRenderer.domElement)) mount.removeChild(labelRenderer.domElement);
    };
  }, []);

  // Rebuild graph when data changes
  useEffect(() => {
    const s = stateRef.current;
    if (!s.scene || !data?.nodes) return;

    const scene = s.scene;
    const wireGroup = s.wireGroup!;
    const nodeGroupMap = s.nodeGroupMap!;
    const nodePositions = s.nodePositions!;

    // Clear previous
    for (const g of nodeGroupMap.values()) scene.remove(g);
    nodeGroupMap.clear();
    nodePositions.clear();
    wireGroup.clear();

    const nodesMap = data.nodes;

    // --- BFS Layout ---
    const levelMap = new Map<string, number>();
    const visited = new Set<string>();
    const startId = data.startNode ?? Object.keys(nodesMap)[0];
    const queue: { id: string; level: number }[] = [{ id: startId, level: 0 }];
    levelMap.set(startId, 0);
    visited.add(startId);

    while (queue.length) {
      const { id: cid, level: cl } = queue.shift()!;
      const nd = nodesMap[cid];
      if (!nd) continue;
      const nexts: string[] = [];
      if (nd.options) nd.options.forEach((o: any) => { if (o.next && nodesMap[o.next]) nexts.push(o.next); });
      if (nd.next && nodesMap[nd.next]) nexts.push(nd.next);
      for (const nid of nexts) {
        if (!visited.has(nid)) {
          visited.add(nid);
          levelMap.set(nid, cl + 1);
          queue.push({ id: nid, level: cl + 1 });
        }
        // Do NOT update existing levels — first-visit (shortest path) wins.
        // Back-edges (like cancel → appointment_start) must not push nodes further right.
      }
    }
    for (const id of Object.keys(nodesMap)) if (!levelMap.has(id)) levelMap.set(id, 0);

    // Group nodes by level
    const byLevel = new Map<number, string[]>();
    for (const [id, lvl] of levelMap) {
      if (!byLevel.has(lvl)) byLevel.set(lvl, []);
      byLevel.get(lvl)!.push(id);
    }
    const sortedLevels = Array.from(byLevel.keys()).sort((a, b) => a - b);

    const X_SPACING = 4.0;
    const Y_SPACING = 2.8;

    // --- Proper tree layout using DFS leaf-counting (Reingold-Tilford simplified) ---
    // Build adjacency: only follow tree edges (first-visit), no cycles
    const treeChildren = new Map<string, string[]>();
    {
      const seen = new Set<string>();
      const q = [startId];
      seen.add(startId);
      while (q.length) {
        const cid = q.shift()!;
        const nd = nodesMap[cid];
        const kids: string[] = [];
        if (nd?.options) nd.options.forEach((o: any) => { if (o.next && nodesMap[o.next] && !seen.has(o.next)) { seen.add(o.next); kids.push(o.next); q.push(o.next); } });
        if (nd?.next && nodesMap[nd.next] && !seen.has(nd.next)) { seen.add(nd.next); kids.push(nd.next); q.push(nd.next); }
        treeChildren.set(cid, kids);
      }
      // Handle disconnected nodes
      for (const id of Object.keys(nodesMap)) if (!treeChildren.has(id)) treeChildren.set(id, []);
    }

    // DFS: assign Y by counting leaves. Each leaf gets a unique slot; 
    // each internal node is the midpoint of its children's Y range.
    const nodeY = new Map<string, number>();
    let leafCounter = 0;
    function assignY(id: string) {
      const kids = treeChildren.get(id) ?? [];
      if (kids.length === 0) {
        nodeY.set(id, leafCounter++ * Y_SPACING);
      } else {
        kids.forEach(k => assignY(k));
        const ys = kids.map(k => nodeY.get(k) ?? 0);
        nodeY.set(id, (Math.min(...ys) + Math.max(...ys)) / 2);
      }
    }
    assignY(startId);

    // Center the whole tree around Y=0
    const allYs = Array.from(nodeY.values());
    const midY = (Math.min(...allYs) + Math.max(...allYs)) / 2;

    // Assign final 3D positions
    for (const [id, lvl] of levelMap) {
      const y = (nodeY.get(id) ?? 0) - midY;
      nodePositions.set(id, new THREE.Vector3(lvl * X_SPACING, y, 0));
    }

    // --- Build incomingLabel map: for each node, what option label led to it ---
    const incomingLabels = s.incomingLabels!;
    incomingLabels.clear();
    for (const [srcId, nd] of Object.entries(nodesMap) as [string, any][]) {
      if (nd.options) {
        nd.options.forEach((o: any) => {
          if (o.next && !incomingLabels.has(o.next)) {
            incomingLabels.set(o.next, o.label ?? o.next);
          }
        });
      }
      if (nd.next && !incomingLabels.has(nd.next)) {
        // input node: label is the field name
        incomingLabels.set(nd.next, `[${nd.field ?? 'input'}]`);
      }
    }
    const nodeColor = (nd: any): number => {
      if (nd.action) return 0xaa77ff;
      if (nd.type === 'input') return 0x33ccaa;
      if (nd.options?.length > 0) return 0x3b82f6;
      return 0xffaa55;
    };

    // --- Build nodes ---
    for (const [id, nd] of Object.entries(nodesMap) as [string, any][]) {
      const pos = nodePositions.get(id)!;
      const group = new THREE.Group();
      group.position.copy(pos);

      const col = nodeColor(nd);
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.58, 36, 36),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.6 })
      );
      group.add(sphere);

      // Aura (matches node color)
      const aura = new THREE.Mesh(
        new THREE.SphereGeometry(0.75, 24, 24),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.15 })
      );
      group.add(aura);

      // CSS2D Label — store both texts as data attributes for fast toggle
      const assistantText = (() => {
        let p = (nd.q ?? id).substring(0, 44);
        if (nd.type === 'input') p = `✏️ ${p}`;
        if (nd.action) p = `⚡ ${p}`;
        if (p.length > 44) p = p.slice(0, 41) + '…';
        return p || id;
      })();
      const userText = s.incomingLabels!.get(id) ?? (id === startId ? '[ start ]' : id);

      const div = document.createElement('div');
      div.dataset.assistant = assistantText;
      div.dataset.user = userText;
      div.style.cssText = `
        background: rgba(5,15,25,0.9);
        backdrop-filter: blur(6px);
        color: #ccf4ff;
        font-size: 11px;
        font-weight: 500;
        padding: 5px 10px;
        border-radius: 6px;
        border: 1.5px solid ${new THREE.Color(col).getStyle()};
        font-family: monospace;
        text-align: center;
        white-space: pre-wrap;
        max-width: 170px;
        pointer-events: none;
        line-height: 1.4;
        user-select: none;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      `;
      div.textContent = assistantText;
      s.labelDivs!.set(id, div);
      const label = new CSS2DObject(div);
      label.position.set(0, 0, 0); // Position exactly at node center
      group.add(label);

      group.userData = { nodeId: id };
      nodeGroupMap.set(id, group);
      scene.add(group);
    }

    // --- Build wires ---
    const edgeSet = new Set<string>();
    const addWire = (srcId: string, tgtId: string) => {
      const key = `${srcId}→${tgtId}`;
      if (edgeSet.has(key)) return;
      edgeSet.add(key);

      const src = nodePositions.get(srcId);
      const tgt = nodePositions.get(tgtId);
      if (!src || !tgt) return;

      // For a left-to-right tree, control points extend horizontally
      // so curves exit the right side of the source and enter the left side of the target
      const dx = (tgt.x - src.x) * 0.5;
      const c1 = new THREE.Vector3(src.x + dx, src.y, src.z);
      const c2 = new THREE.Vector3(tgt.x - dx, tgt.y, tgt.z);
      const curve = new THREE.CubicBezierCurve3(src, c1, c2, tgt);
      const pts = curve.getPoints(64);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);

      // Primary wire — bright cyan line primitive (native WebGL, no triangles)
      wireGroup.add(new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: 0x33ccff, transparent: true, opacity: 0.75 })
      ));

      // Softer glow duplicate at lower opacity for depth
      wireGroup.add(new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: 0xaaffff, transparent: true, opacity: 0.2 })
      ));
    };

    for (const [srcId, nd] of Object.entries(nodesMap) as [string, any][]) {
      if (nd.options) nd.options.forEach((o: any) => { if (o.next && nodesMap[o.next]) addWire(srcId, o.next); });
      if (nd.next && nodesMap[nd.next]) addWire(srcId, nd.next);
    }

    // Camera: look at center of tree
    const maxLevel = Math.max(...sortedLevels);
    const centerX = (maxLevel * 4.0) / 2; // positive because tree grows right
    if (s.camera && s.controls) {
      s.controls.target.set(centerX, 0, 0);
      s.camera.position.set(centerX, 2, 16);
    }
  }, [data]);

  // Highlight path & update on pathStack / currentNodeId change
  useEffect(() => {
    const s = stateRef.current;
    if (!s.nodeGroupMap) return;

    const pathSet = new Set(pathStack);

    for (const [id, group] of s.nodeGroupMap) {
      const sphere = group.children.find((c): c is THREE.Mesh => c instanceof THREE.Mesh && c.geometry instanceof THREE.SphereGeometry && (c.geometry as THREE.SphereGeometry).parameters.radius < 0.65);
      const aura = group.children.find((c): c is THREE.Mesh => c instanceof THREE.Mesh && c.geometry instanceof THREE.SphereGeometry && (c.geometry as THREE.SphereGeometry).parameters.radius > 0.7);
      
      const div = s.labelDivs?.get(id);

      if (id === currentNodeId) {
        // Current active node
        if (sphere) {
          const mat = sphere.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.9;
          sphere.scale.setScalar(1.15);
        }
        if (aura) {
          const mat = aura.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.35;
          aura.scale.setScalar(1.2);
        }
        if (div) {
          div.style.opacity = '1.0';
          div.style.boxShadow = '0 0 16px rgba(59, 130, 246, 0.4)';
          div.style.transform = 'scale(1.05)';
        }
      } else if (pathSet.has(id)) {
        // Visited path node
        if (sphere) {
          const mat = sphere.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.6;
          sphere.scale.setScalar(1.0);
        }
        if (aura) {
          const mat = aura.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.15;
          aura.scale.setScalar(1.0);
        }
        if (div) {
          div.style.opacity = '0.8';
          div.style.boxShadow = 'none';
          div.style.transform = 'scale(1.0)';
        }
      } else {
        // Unvisited node (dimmed out)
        if (sphere) {
          const mat = sphere.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.15;
          sphere.scale.setScalar(1.0);
        }
        if (aura) {
          const mat = aura.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.0;
          aura.scale.setScalar(1.0);
        }
        if (div) {
          div.style.opacity = '0.35';
          div.style.boxShadow = 'none';
          div.style.transform = 'scale(1.0)';
        }
      }
    }

    // Smooth camera transition to current node
    if (currentNodeId && s.nodePositions && s.camera && s.controls) {
      const targetPos = s.nodePositions.get(currentNodeId);
      if (targetPos) {
        s.transitionFrom = {
          camPos: s.camera.position.clone(),
          target: s.controls.target.clone(),
        };
        const offsetTarget = targetPos.clone();
        offsetTarget.x += 2.5; // Shift focus right by 2.5, keeping node slightly left of center
        s.transitionTo = offsetTarget;
        s.transitionStart = performance.now();
        s.transitionActive = true;
      }
    }
  }, [pathStack, currentNodeId]);

  // Swap label text when toggle changes — no Three.js rebuild needed
  useEffect(() => {
    const divs = stateRef.current.labelDivs;
    if (!divs) return;
    for (const [, div] of divs) {
      div.textContent = showUser
        ? (div.dataset.user ?? '')
        : (div.dataset.assistant ?? '');
    }
  }, [showUser]);

  // Always render the mount div so the Three.js useEffect can attach.
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div className="tree-header" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px', pointerEvents: 'auto' }}>
        <h2 style={{ margin: 0, flex: 1 }}>Conversation Graph</h2>
        <button
          onClick={() => setShowUser(u => !u)}
          style={{
            padding: '4px 14px',
            borderRadius: '20px',
            border: `1.5px solid ${showUser ? '#34d399' : '#3b82f6'}`,
            background: showUser ? 'rgba(52,211,153,0.12)' : 'rgba(59,130,246,0.12)',
            color: showUser ? '#34d399' : '#93c5fd',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.04em',
            transition: 'all 0.25s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {showUser ? '👤 User' : '🤖 Assistant'}
        </button>
      </div>
      {(!data?.nodes || !currentNodeId) && (
        <div className="tree-visualizer-empty" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          No graph data.
        </div>
      )}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
