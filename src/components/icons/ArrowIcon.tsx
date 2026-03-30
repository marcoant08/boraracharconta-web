type ArrowDirection = 'left' | 'right' | 'up' | 'down';

const rotationMap: Record<ArrowDirection, string> = {
  left: 'rotate(0deg)',
  right: 'rotate(180deg)',
  up: 'rotate(90deg)',
  down: 'rotate(-90deg)',
};

interface ArrowIconProps {
  direction: ArrowDirection;
  size?: number;
  color?: string;
  className?: string;
}

export const ArrowIcon = ({ direction, size = 24, color = 'currentColor', className }: ArrowIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill={color}
    viewBox="0 0 256 256"
    className={className}
    style={{ transform: rotationMap[direction] }}
  >
    <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
  </svg>
);
