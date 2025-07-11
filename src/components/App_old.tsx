// import React, { useState, useCallback } from "react";
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   MiniMap,
//   applyNodeChanges,
//   applyEdgeChanges,
//   addEdge,
//   type Node,
//   type Edge,
//   type FitViewOptions,
//   type OnConnect,
//   type OnNodesChange,
//   type OnEdgesChange,
//   type OnNodeDrag,
//   type DefaultEdgeOptions,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";

// import Belief from "./components/Belief";
// import { BeliefNode } from "./components/BeliefNode";
// import { BeliefEdge } from "./components/BeliefEdge";

// // TODO these are temporarily defined outside of App
// const initialNodes: Node[] = [
//   {
//     id: "n1",
//     position: { x: 0, y: 0 },
//     data: { label: "Node " },
//     type: "belief",
//   },
//   {
//     id: "n2",
//     position: { x: 0, y: 100 },
//     data: { label: "Node 2" },
//     type: "belief",
//     parentId: "n1",
//   },
// ];
// const initialEdges: Edge[] = [
//   {
//     id: "n1-n2",
//     source: "n1",
//     target: "n2",
//     type: "beliefEdge",
//   },
// ];

// function App() {
//   // const [editingBelief, setEditingBelief] = useState<number | null>(null);
//   // const [beliefs, setBeliefs] = useState<Belief[]>([
//   //   {
//   //     id: 0,
//   //     text: "The Earth orbits the Sun.",
//   //     acceptanceLeft: false,
//   //     acceptanceRight: false,
//   //     x: 0,
//   //     y: 0,
//   //     supports: [
//   //       {
//   //         id: 1,
//   //         text: "The Sun is the center of our solar system.",
//   //         acceptanceLeft: false,
//   //         acceptanceRight: false,
//   //         x: 100,
//   //         y: 100,
//   //         supports: [
//   //           {
//   //             id: 2,
//   //             text: "The Sun is a star.",
//   //             acceptanceLeft: false,
//   //             acceptanceRight: false,
//   //             x: 200,
//   //             y: 200,
//   //           },
//   //         ],
//   //       },
//   //     ],
//   //   },
//   // ]);

//   // // Track mouse position for click vs drag detection
//   // const [mouseDownPos, setMouseDownPos] = useState<{
//   //   x: number;
//   //   y: number;
//   // } | null>(null);

//   // const handleEditingBeliefChange = (id: number | null) => {
//   //   console.log("Editing belief changed to:", id);
//   //   setEditingBelief(id);
//   // };

//   // const handleAddBeliefAt = (x: number, y: number) => {
//   //   setBeliefs((prev) => {
//   //     const newId = nextId++;
//   //     // Add the new belief
//   //     const newBeliefs = [
//   //       ...prev,
//   //       {
//   //         id: newId,
//   //         text: "New Belief",
//   //         description: "",
//   //         acceptanceLeft: false,
//   //         acceptanceRight: false,
//   //         x,
//   //         y,
//   //         locked: false,
//   //       },
//   //     ];
//   //     return newBeliefs;
//   //   });
//   // };

//   // // Listen for ctrl+click anywhere in the document
//   // React.useEffect(() => {
//   //   const handleCtrlClick = (e: MouseEvent) => {
//   //     if (e.ctrlKey) {
//   //       // Get click position relative to the app container
//   //       const appDiv = document.querySelector(".App");
//   //       if (!appDiv) return;
//   //       const rect = appDiv.getBoundingClientRect();
//   //       const x = e.clientX - rect.left;
//   //       const y = e.clientY - rect.top;
//   //       handleAddBeliefAt(x, y);
//   //     }

//   //     // If currently editing a belief, stop editing
//   //     if (editingBelief !== null) {
//   //       setEditingBelief(null);
//   //     }
//   //   };
//   //   document.addEventListener("click", handleCtrlClick);
//   //   return () => document.removeEventListener("click", handleCtrlClick);
//   // }, []);

//   // // Recursively update a belief's x/y by id in a nested belief tree
//   // function updateBeliefPosition(
//   //   beliefs: Belief[],
//   //   id: number,
//   //   x: number,
//   //   y: number
//   // ): Belief[] {
//   //   return beliefs.map((b) => {
//   //     if (b.id === id) {
//   //       return { ...b, x, y };
//   //     }
//   //     let updated = { ...b };
//   //     if (b.supports) {
//   //       updated.supports = updateBeliefPosition(b.supports, id, x, y);
//   //     }
//   //     if (b.opposes) {
//   //       updated.opposes = updateBeliefPosition(b.opposes, id, x, y);
//   //     }
//   //     return updated;
//   //   });
//   // }
//   const nodeTypes = {
//     belief: BeliefNode,
//   };

//   const edgeTypes = {
//     beliefEdge: BeliefEdge,
//   };

//   const [nodes, setNodes] = useState<Node[]>(initialNodes);
//   const [edges, setEdges] = useState<Edge[]>(initialEdges);

//   const onNodesChange = useCallback(
//     (changes) =>
//       setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
//     [setNodes]
//   );
//   const onEdgesChange = useCallback(
//     (changes) =>
//       setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
//     [setEdges]
//   );
//   const onConnect = useCallback(
//     (connection) =>
//       setEdges((edgesSnapshot) => addEdge(connection, edgesSnapshot)),
//     [setEdges]
//   );

//   return (
//     <div style={{ width: "100vw", height: "100vh" }}>
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         nodeTypes={nodeTypes}
//         edgeTypes={edgeTypes}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//         colorMode="dark"
//         fitView
//       >
//         <Background />
//         <Controls />
//         <MiniMap />
//       </ReactFlow>
//     </div>
//     // <div
//     //   id="background-container"
//     //   className="bg-secondary position-relative"
//     //   tabIndex={0}
//     //   onClick={(e) => {
//     //     // Focus the background container on click to end Belief editing
//     //     if (editingBelief !== null) {
//     //       setEditingBelief(null);
//     //     }
//     //     document.getElementById("background-container")?.focus();
//     //   }}
//     // >

//     // </div>
//     //       <div
//     //         className="App p-4 bg-secondary position-relative"
//     //         style={{ zIndex: 0, minHeight: "100vh", minWidth: "100vw" }}
//     //         onMouseDown={(e) => {
//     //           if (editingBelief !== null) {
//     //             setEditingBelief(null);
//     //           }
//     //           document.getElementById("background-container")?.focus();
//     //         }}
//     //         tabIndex={0}
//     //       >
//     //         {beliefs.map((belief) => (
//     //           <Belief
//     //             key={belief.id}
//     //             belief={belief}
//     //             handleEditingBeliefChange={handleEditingBeliefChange}
//     //             onPositionChange={(newX, newY, id = belief.id) => {
//     //               setBeliefs((prev) =>
//     //                 updateBeliefPosition(prev, id, newX, newY)
//     //               );
//     //             }}
//     //           />
//     //         ))}
//     //       </div>
//   );
// }

// export default App;
