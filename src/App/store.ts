import {
  type Node,
  type Edge,
  type EdgeChange,
  type NodeChange,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  getNodesBounds,
  type XYPosition,
  type InternalNode,
  useInternalNode,
} from "@xyflow/react";
import { create } from "zustand";
import { nanoid } from "nanoid/non-secure";

import type { BeliefNode, BeliefEdge, NodeData } from "./types";

export type RFState = {
  nodes: BeliefNode[];
  edges: BeliefEdge[];
  setNodes: (nodes: BeliefNode[]) => void;
  setEdges: (edges: BeliefEdge[]) => void;
  onNodesChange: OnNodesChange<BeliefNode>;
  onEdgesChange: OnEdgesChange<BeliefEdge>;
  updateNodeLabel: (
    nodeId: string,
    label: string,
    resetLeftChildren: boolean,
    resetRightChildren: boolean
  ) => void;
  updateNodeUserAcceptance: (
    nodeId: string,
    side: "left" | "right",
    userAcceptance: boolean
  ) => void;
  updateNodeParentSupport: (nodeId: string, supportsParent: boolean) => void;
  updateNodeChildPosition: (nodeId: string, currentWidth: number) => void;
  addNode: (position: XYPosition, user: "left" | "right" | "both") => void;
  addChildNode: (
    parentNode: InternalNode,
    position: XYPosition,
    parentHandleId: string | null
  ) => void;
  addParentNode: (childNode: InternalNode, position: XYPosition) => void;
  addEdge: (
    childNode: InternalNode,
    parentNode: InternalNode,
    parentHandleId: string | null
  ) => void;
  onDelete: () => void;
  updateNodeConnectingUser: (
    nodeId: string,
    user: "left" | "right" | "both" | null
  ) => void;
  collapseNodeBeliefs: (nodeId: string) => void;
  restoreNodeBeliefs: (nodeId: string) => void;
};

const useStore = create<RFState>((set, get) => ({
  nodes: [
    {
      id: "root",
      type: "belief",
      data: {
        label: "",
        placeholderLabel: "What do you believe?",
        user: "both", // Indicates this belief is shared by both users
        supportsParent: true,
        alignsWithParent: true,
        leftAcceptance: false,
        rightAcceptance: false,
      },
      position: { x: 0, y: 0 },
    },
  ],
  edges: [],
  setNodes: (nodes: BeliefNode[]) => {
    set({ nodes });
  },
  setEdges: (edges: BeliefEdge[]) => {
    set({ edges });
  },
  onNodesChange: (changes: NodeChange<BeliefNode>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange<BeliefEdge>[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  updateNodeLabel: (
    nodeId: string,
    label: string,
    resetLeftChildren: boolean,
    resetRightChildren: boolean
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          if (resetLeftChildren || resetRightChildren) {
            // If the label has changed, reset acceptance states for the other user
            return {
              ...node,
              data: {
                ...node.data,
                label,
                leftAcceptance: resetLeftChildren
                  ? false
                  : node.data.leftAcceptance,
                rightAcceptance: resetRightChildren
                  ? false
                  : node.data.rightAcceptance,
              },
            };
          }

          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            data: { ...node.data, label },
          };
        }

        // For each child of this parent, need to possibly reset their supportsParent and alignsWithParent states
        if (
          node.parentId === nodeId &&
          ((node.data.user === "left" && resetLeftChildren) ||
            (node.data.user === "right" && resetRightChildren))
        ) {
          return {
            ...node,
            data: {
              ...node.data,
              alignsWithParent: !node.data.alignsWithParent,
            },
          };
        }

        return node;
      }),
    });
  },
  updateNodeUserAcceptance: (
    nodeId: string,
    side: "left" | "right",
    userAcceptance: boolean
  ) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            data: {
              ...node.data,
              [`${side}Acceptance`]: userAcceptance,
            },
          };
        }

        if (node.parentId === nodeId && node.data.user === side) {
          // If the iterated node is a child of the node being updated, determine if it aligns with the parent's acceptance state
          if (node.data.label === "") {
            // If the child node has no label, it should always align with the parent's acceptance state
            return {
              ...node,
              data: {
                ...node.data,
                alignsWithParent: true,
                supportsParent: userAcceptance,
              },
            };
          } else {
            return {
              ...node,
              data: {
                ...node.data,
                alignsWithParent: userAcceptance == node.data.supportsParent,
              },
            };
          }
        }

        return node;
      }),
    });
  },
  updateNodeParentSupport: (nodeId: string, supportsParent: boolean) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            data: {
              ...node.data,
              supportsParent,
              // If the node supports its parent, it aligns with the parent's acceptance state
              alignsWithParent: !node.data.alignsWithParent,
            },
          };
        }

        return node;
      }),
    });
  },
  updateNodeChildPosition: (nodeId: string, changeInWidth: number) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.parentId === nodeId) {
          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            position: {
              x: node.position.x - changeInWidth / 2, // offset the child node position
              y: node.position.y,
            },
          };
        }
        return node;
      }),
    });
  },
  addNode: (position: XYPosition, user: "left" | "right" | "both") => {
    const newNode: BeliefNode = {
      id: nanoid(),
      type: "belief",
      data: {
        label: "",
        placeholderLabel: "What do you believe?",
        user: user,
        supportsParent: true, // Initially has no parent
        alignsWithParent: true, // Initially has no parent
        leftAcceptance: user === "left" ? true : false,
        rightAcceptance: user === "right" ? true : false,
      },
      position,
    };

    set({
      nodes: [...get().nodes, newNode],
    });
  },
  addChildNode: (
    parentNode: InternalNode,
    position: XYPosition,
    parentHandleId: string | null
  ) => {
    let parentAbsolutePosition = {
      x: parentNode.internals.positionAbsolute.x,
      y: parentNode.internals.positionAbsolute.y,
    };
    const user = parentHandleId?.includes("left")
      ? "left"
      : parentHandleId?.includes("right")
      ? "right"
      : "both";
    const newNode: BeliefNode = {
      id: nanoid(),
      type: "belief",
      data: {
        label: "",
        placeholderLabel: "What do you believe?",
        // TODO need to define USER ID globally
        user: user, // Indicates which user this belief belongs to
        supportsParent: Boolean(parentNode.data[`${user}Acceptance`]), // Depends on the User's acceptance state of the parent belief
        alignsWithParent: true, // Initially aligns with parent belief's acceptance state
        // User who creates belief will always accept it until manually changed
        leftAcceptance: user === "left" ? true : false,
        rightAcceptance: user === "right" ? true : false,
      },
      position: {
        x: position.x - parentAbsolutePosition.x,
        y: position.y - parentAbsolutePosition.y,
      },
      parentId: parentNode.id,
    };

    set({
      nodes: [...get().nodes, newNode],
    });

    if (parentHandleId !== null) {
      const newEdge: BeliefEdge = {
        id: nanoid(),
        type: "beliefEdge",
        target: newNode.id,
        source: parentNode.id,
        sourceHandle: parentHandleId,
        zIndex: -2,
      };

      set({
        edges: [...get().edges, newEdge],
      });
    }
  },
  addParentNode: (childNode: InternalNode, position: XYPosition) => {
    // Get the user from the child node (this is the user that asserting new belief)
    const user = (childNode.data as BeliefNode["data"]).connectingUser;

    // Create new parent node based on the child node's position
    const newNode: BeliefNode = {
      id: nanoid(),
      type: "belief",
      data: {
        label: "",
        placeholderLabel: "What do you believe?",
        user: user === "left" || user === "right" ? user : "both", // Indicates which user this belief belongs to
        supportsParent: true, // Initially has no parent
        alignsWithParent: true, // Initially has no parent
        // User who creates belief will always accept it until manually changed
        leftAcceptance: user === "left" ? true : false,
        rightAcceptance: user === "right" ? true : false,
      },
      position: {
        x: position.x,
        y: position.y,
      },
    };

    // TODO can avoid sort here by adding at front of array
    set({
      nodes: [...get().nodes, newNode],
    });

    // Update the child node to have this new node as its parent,
    // and update its position to be relative to the new parent node
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === childNode.id) {
          return {
            ...node,
            parentId: newNode.id,
            position: {
              // This is a hack to position the child node relative to the new parent node
              // But listen, it works and you can't access the new parent node's internals here
              x:
                node.position.x -
                (newNode.position.x - (node.measured?.width / 2 || 0) - 11.75),
              y: node.position.y - newNode.position.y,
            },
            data: {
              ...node.data,
              // The child node is now claimed by the user asserting the new parent node
              user: user,
              supportsParent: true,
              alignsWithParent: true,
            },
          };
        }
        return node;
      }),
    });

    // TODO define this outside, we're going to use it in multiple places
    // Recursively find all child nodes, and add them to the sorted nodes
    const addChildren = (parentId: string) => {
      get().nodes.forEach((child) => {
        if (child.parentId === parentId) {
          sortedNodes.push(child);
          addChildren(child.id);
        }
      });
    };

    // Sort nodes to ensure the new parent node is added after the child node
    // This is important for React Flow to render the edges correctly
    let sortedNodes: BeliefNode[] = [];
    get().nodes.forEach((node) => {
      if (node.parentId == null) {
        sortedNodes.push(node);
        addChildren(node.id);
      }
    });

    set({
      nodes: [...sortedNodes],
    });

    // Create edge from the new parent node to the child node
    const parentHandleId = `source-${newNode.id}-${user}`; // This is the handle ID for the parent node to connect to the child node
    const newEdge: BeliefEdge = {
      id: nanoid(),
      type: "beliefEdge",
      target: childNode.id,
      source: newNode.id,
      sourceHandle: parentHandleId,
      zIndex: -2,
    };

    set({
      edges: [...get().edges, newEdge],
    });
  },
  addEdge: (
    childNode: InternalNode,
    parentNode: InternalNode,
    parentHandleId: string | null
  ) => {
    const newEdge: BeliefEdge = {
      id: nanoid(),
      type: "beliefEdge",
      target: childNode.id,
      source: parentNode.id,
      sourceHandle: parentHandleId,
      zIndex: -2,
    };

    set({
      edges: [...get().edges, newEdge],
    });

    // Update the child node to have this new node as its parent,
    // and update its position to be relative to the new parent node
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === childNode.id) {
          return {
            ...node,
            parentId: parentNode.id,
            position: {
              x: node.position.x - parentNode.internals.positionAbsolute.x,
              y: node.position.y - parentNode.internals.positionAbsolute.y,
            },
            data: {
              ...node.data,
              // The child node is now claimed by the user asserting the new parent node
              user: parentHandleId?.includes("left")
                ? "left"
                : parentHandleId?.includes("right")
                ? "right"
                : "both",
              supportsParent: true,
              alignsWithParent: true,
            },
          };
        }
        return node;
      }),
    });

    // TODO define this outside, we're going to use it in multiple places
    // Recursively find all child nodes, and add them to the sorted nodes
    const addChildren = (parentId: string) => {
      get().nodes.forEach((child) => {
        if (child.parentId === parentId) {
          sortedNodes.push(child);
          addChildren(child.id);
        }
      });
    };

    // Sort nodes to ensure the new parent node is added after the child node
    // This is important for React Flow to render the edges correctly
    let sortedNodes: BeliefNode[] = [];
    get().nodes.forEach((node) => {
      if (node.parentId == null) {
        sortedNodes.push(node);
        addChildren(node.id);
      }
    });

    set({
      nodes: [...sortedNodes],
    });
  },
  onDelete: () => {
    // We must filter out the nodes that are unselected
    const nodesToDelete = (get().nodes as BeliefNode[]).filter(
      (node) => node.selected
    );
    const nodeIdsToDelete = new Set(nodesToDelete.map((n) => n.id));
    const parentNodePositions = new Map<string, XYPosition>();

    // Need to recursively find absolute positions of all parent nodes
    get().nodes.forEach((node) => {
      let currentNode: BeliefNode | undefined = node;
      let nextNode: BeliefNode | undefined;
      let parentAbsolutePosition = {
        x: 0,
        y: 0,
      };
      while (currentNode) {
        parentAbsolutePosition.x += currentNode.position.x;
        parentAbsolutePosition.y += currentNode.position.y;

        nextNode = get().nodes.find((c) => c.id === currentNode?.parentId);
        // Need to update the position by the width of its immediate parent as well
        if (nextNode === undefined) {
          // TODO please god put this width calculation in a util class
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) {
            console.error("Failed to get canvas context");
            return;
          }
          const font = "12px monospace"; // Adjust as needed
          context.font = font;
          const metrics = context.measureText(currentNode.data.label);
          let currentWidth = 0;

          const placeHolderMetrics = context.measureText(
            currentNode.data.placeholderLabel
          );
          const placeholderWidth = Math.ceil(placeHolderMetrics.width);
          if (metrics.width < placeholderWidth) {
            // If the label is empty/smaller than placeholder, we use the placeholder width
            currentWidth = Math.ceil(placeHolderMetrics.width);
          } else if (metrics.width < 300) {
            // If the label is less than 300px, we use the label width
            currentWidth = Math.ceil(metrics.width);
          } else {
            currentWidth = 300; // Set a max width
          }
          // TODO this is not quite right, something with the padding
          parentAbsolutePosition.x -= currentWidth + 20;
        }
        currentNode = nextNode;
      }
      parentNodePositions.set(node.id, parentAbsolutePosition);
    });

    set({
      nodes: get()
        .nodes.filter((node) => !node.selected)
        .map((node) => {
          // If the node being deleted is a parent, we need to remove its parentId from its children
          if (node.parentId && nodeIdsToDelete.has(node.parentId)) {
            console.log("Keeping child node:", node.id);
            return {
              ...node,
              // Reset the position of the child node from being relative to the parent's position
              position: {
                x: node.position.x + parentNodePositions.get(node.parentId)?.x,
                y: node.position.y + parentNodePositions.get(node.parentId)?.y,
              },
              parentId: undefined,
            };
          }
          console.log("Keeping node:", node.id);
          return node;
        }),
      // Filter out edges that are connected to the nodes being deleted
      edges: get().edges.filter(
        (edge) =>
          !nodeIdsToDelete.has(edge.source) && !nodeIdsToDelete.has(edge.target)
      ),
    });

    // Now delete the edges that are selected
    const edgesToDelete = get().edges.filter((edge) => edge.selected);
    const nodesToRemoveLineage = new Set<string>();
    edgesToDelete.forEach((edge) => {
      // If the edge is a child of a node being deleted, we need to remove the lineage
      nodesToRemoveLineage.add(edge.target);
    });
    console.log("Nodes to remove lineage:", nodesToRemoveLineage);
    const edgeIdsToDelete = new Set(edgesToDelete.map((e) => e.id));
    set({
      // Set nodes with deleted edges to not have parentId any longer
      nodes: get().nodes.map((node) => {
        if (nodesToRemoveLineage.has(node.id)) {
          return {
            ...node,
            // Reset the position of the child node from being relative to the parent's position
            // TODO these positions are not getting set right AT ALL
            position: {
              x: node.position.x + parentNodePositions.get(node.id)?.x,
              y: node.position.y + parentNodePositions.get(node.id)?.y,
            },
            parentId: undefined,
          };
        }
        return node;
      }),
      // Filter out edges that are connected to the edges being deleted
      edges: get().edges.filter((edge) => !edgeIdsToDelete.has(edge.id)),
    });
  },
  updateNodeConnectingUser: (
    nodeId: string,
    user: "left" | "right" | "both" | null
  ) =>
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          // it's important to create a new node here, to inform React Flow about the changes
          return {
            ...node,
            data: {
              ...node.data,
              connectingUser: user,
            },
          };
        }
        return node;
      }),
    }),
  collapseNodeBeliefs: (nodeId: string) => {
    let collapsedNodes: BeliefNode[] = [];
    let collapsedNodeData: BeliefNode | undefined;
    const collapseChildren = (parentNode: BeliefNode) => {
      let newParentNode = parentNode;
      get().nodes.forEach((child) => {
        if (child.parentId === parentNode.id) {
          collapsedNodes.push(child);
          let newChildNode = collapseChildren(child);
          newParentNode = {
            ...parentNode,
            data: {
              ...parentNode.data,
              collapsedChildren: [
                ...(newParentNode.data.collapsedChildren || []),
                {
                  ...child,
                  data: {
                    ...child.data,
                    collapsedChildren:
                      newChildNode.data.collapsedChildren || [],
                  },
                },
              ],
            },
          };
        }
      });
      return newParentNode;
    };

    // Iterate over all Nodes recursively to find all child nodes, and add them to the collapsedNodeData
    set({
      nodes: get()
        .nodes.map((node) => {
          if (node.id === nodeId) {
            collapsedNodeData = collapseChildren(node);
            // it's important to create a new node here, to inform React Flow about the changes
            return {
              ...node,
              data: {
                ...node.data,
                collapsed: true,
                collapsedChildren:
                  collapsedNodeData?.data.collapsedChildren || [],
              },
            };
          }
          return node;
        })
        // Remove all collapsed nodes from the main nodes array
        .filter((node) => !collapsedNodes.includes(node)),
    });
  },
  restoreNodeBeliefs: (nodeId: string) => {
    let nodesToRestore: BeliefNode[] = [];

    const restoreChildren = (parent: BeliefNode) => {
      parent.data.collapsedChildren?.forEach((child) => {
        if (!child.data.collapsed) {
          const restoredChildNode: BeliefNode = {
            ...child,
            data: {
              ...child.data,
              collapsedChildren: [],
            },
          };
          // Need to push the parent node before the child node
          nodesToRestore.push(restoredChildNode);
          restoreChildren(child);
        } else {
          // If the child node is collapsed, we need to restore it as is, and not restore its children
          nodesToRestore.push(child);
        }
      });
    };

    const nodeToRestore = get().nodes.find((n) => n.id === nodeId);
    if (nodeToRestore) {
      restoreChildren(nodeToRestore);
    }

    set({
      nodes: get()
        .nodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                collapsedChildren: [],
              },
            };
          }
          return node;
        })
        .concat(...nodesToRestore),
    });
  },
}));

export default useStore;
