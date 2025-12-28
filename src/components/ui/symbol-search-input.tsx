"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SymbolLogo } from "@/components/ui/symbol-logo";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import {
  searchSymbols,
  type SymbolSearchResult,
} from "@/app/actions/symbols";
import type { MarketType } from "@/lib/db/schema";

interface SymbolSearchInputProps {
  value: string;
  onChange: (symbol: string, result?: SymbolSearchResult) => void;
  markets?: MarketType[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SymbolSearchInput({
  value,
  onChange,
  markets = ["stock", "etf"],
  placeholder = "Search symbol...",
  disabled = false,
  className,
}: SymbolSearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [results, setResults] = useState<SymbolSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync input value with prop value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search function
  const handleSearch = useCallback(
    async (query: string) => {
      if (!query || query.length < 1) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchSymbols(query, markets);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0 || query.length >= 1);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Symbol search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [markets]
  );

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    onChange(newValue);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      handleSearch(newValue);
    }, 150);
  };

  // Handle selection
  const handleSelect = (result: SymbolSearchResult) => {
    setInputValue(result.symbol);
    onChange(result.symbol, result);
    setIsOpen(false);
    setResults([]);
    inputRef.current?.focus();
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-result-item]");
      const item = items[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" && results.length > 0) {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case "Tab":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (inputValue && results.length > 0) {
      setIsOpen(true);
    } else if (inputValue && inputValue.length >= 1) {
      handleSearch(inputValue);
    }
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Market type badge variant
  const getMarketBadgeVariant = (marketType: MarketType) => {
    switch (marketType) {
      case "etf":
        return "secondary";
      case "stock":
      default:
        return "outline";
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className={cn("relative", className)}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-9 pr-9 uppercase"
            autoComplete="off"
            spellCheck="false"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            role="combobox"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          )}
        </div>
      </PopoverAnchor>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div
          ref={listRef}
          className="max-h-[300px] overflow-y-auto"
          role="listbox"
        >
          {results.length === 0 && inputValue.length >= 1 && !isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No results for &quot;{inputValue}&quot;
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={result.symbol}
                type="button"
                data-result-item
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                  "hover:bg-accent focus:bg-accent focus:outline-none",
                  "min-h-[44px]", // Mobile-friendly touch target
                  highlightedIndex === index && "bg-accent"
                )}
                role="option"
                aria-selected={highlightedIndex === index}
              >
                <SymbolLogo
                  symbol={result.symbol}
                  name={result.name}
                  logoUrl={result.logoUrl}
                  marketType={result.marketType}
                  size="sm"
                />
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {result.symbol}
                    </span>
                    <Badge
                      variant={getMarketBadgeVariant(result.marketType)}
                      className="text-[10px] px-1.5 py-0 h-4 uppercase"
                    >
                      {result.marketType}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground truncate">
                    {result.name}
                  </span>
                </div>
                {result.exchange && (
                  <span className="text-xs text-muted-foreground ml-2 shrink-0">
                    {result.exchange}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
