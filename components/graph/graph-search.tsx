"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { useReactFlow, Node } from "@xyflow/react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface GraphSearchProps {
  nodes: Node[];
}

export function GraphSearch({ nodes }: GraphSearchProps) {
  const { setCenter, zoomTo } = useReactFlow();
  const [open, setOpen] = useState(false);

  // Handle selecting a node from the list
  const onSelect = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);

    if (node) {
      const { x, y } = node.position;
      setCenter(x, y, { zoom: 2, duration: 1000 });

      // TODO: Implement the same hover-highlighting feature for search results
    }

    setOpen(false);
  };

  return (
    <div className="w-64 md:w-80 shadow-lg rounded-lg overflow-hidden border bg-background">
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder="Search topics..."
          onFocus={() => setOpen(true)}
          // Keep it open if there is text, or close on blur
          onBlur={() => setTimeout(() => setOpen(false), 200)}
        />
        <CommandList
          className={cn(
            "transition-all duration-300",
            !open && "h-0 overflow-hidden py-0"
          )}
        >
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {nodes.map((node) => (
              <CommandItem
                key={node.id}
                value={node.data.label as string} // Filter by label
                onSelect={() => onSelect(node.id)}
                className="cursor-pointer"
              >
                <Search className="mr-2 h-4 w-4 opacity-50" />
                <span>{node.data.label as string}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
