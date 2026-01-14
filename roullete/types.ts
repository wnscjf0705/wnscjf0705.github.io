export interface MenuItem {
  id: string;
  label: string;
  color: string;
}

export interface WheelProps {
  items: MenuItem[];
  mustSpin: boolean;
  prizeNumber: number;
  onStopSpinning: () => void;
}

export const WHEEL_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#82E0AA", // Green
  "#F1948A", // Pink
  "#85C1E9", // Light Blue
];