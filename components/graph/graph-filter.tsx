"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CategoryOption {
  name: string;
  color: string;
}

interface GraphFilterProps {
  categories: CategoryOption[];
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
}

export function GraphFilter({
  categories,
  selectedCategories,
  onToggleCategory,
}: GraphFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-background shadow-md"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium leading-none text-muted-foreground">
            Filter Categories
          </h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${cat.name}`}
                  checked={selectedCategories.includes(cat.name)}
                  onCheckedChange={() => onToggleCategory(cat.name)}
                />
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <Label
                  htmlFor={`cat-${cat.name}`}
                  className="text-sm cursor-pointer"
                >
                  {cat.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
