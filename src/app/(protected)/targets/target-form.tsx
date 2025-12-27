"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { createTarget, updateTarget, type TargetFormData } from "@/app/actions/targets";
import type { Target, TargetType } from "@/lib/db/schema";

const TARGET_TYPES: { value: TargetType; label: string; description: string }[] = [
  { value: "growth", label: "Growth", description: "High growth potential stocks" },
  { value: "value", label: "Value", description: "Undervalued opportunities" },
  { value: "momentum", label: "Momentum", description: "Trending price action" },
  { value: "dividend", label: "Dividend", description: "Income-generating assets" },
  { value: "speculative", label: "Speculative", description: "High risk/reward plays" },
];

interface TargetFormProps {
  target?: Target;
  onSuccess?: () => void;
}

export function TargetForm({ target, onSuccess }: TargetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [thesis, setThesis] = useState(target?.thesis || "");
  const [targetType, setTargetType] = useState<TargetType>(target?.targetType || "growth");
  const [catalyst, setCatalyst] = useState(target?.catalyst || "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>((target?.tags as string[]) || []);

  const isEditing = !!target;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: TargetFormData = {
      thesis,
      targetType,
      catalyst: catalyst || undefined,
      tags,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateTarget(target.id, formData)
        : await createTarget(formData);

      if (result.success) {
        toast.success(isEditing ? "Target updated" : "Target created");
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/targets");
        }
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Target" : "Create Target"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your investment thesis and details."
            : "Document your investment thesis for a new target."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thesis */}
          <div className="space-y-2">
            <Label htmlFor="thesis">Investment Thesis *</Label>
            <Textarea
              id="thesis"
              placeholder="Describe your investment thesis. What do you believe about this opportunity and why?"
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              rows={4}
              className="resize-none"
              required
              minLength={10}
            />
            <p className="text-sm text-muted-foreground">
              Minimum 10 characters. Be specific about your reasoning.
            </p>
          </div>

          {/* Target Type */}
          <div className="space-y-2">
            <Label htmlFor="targetType">Target Type *</Label>
            <Select
              value={targetType}
              onValueChange={(value) => setTargetType(value as TargetType)}
            >
              <SelectTrigger id="targetType">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {TARGET_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Catalyst */}
          <div className="space-y-2">
            <Label htmlFor="catalyst">Catalyst (Optional)</Label>
            <Input
              id="catalyst"
              placeholder="e.g., Earnings report, Product launch, FDA approval"
              value={catalyst}
              onChange={(e) => setCatalyst(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              What event might trigger price movement?
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <span className="ml-1">&times;</span>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Click a tag to remove it.
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isPending || thesis.length < 10}>
              {isPending ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Target"
              ) : (
                "Create Target"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
