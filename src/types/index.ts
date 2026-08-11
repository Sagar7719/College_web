// UI & Primitive Types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export type InputSize = 'sm' | 'md' | 'lg';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export interface OptionItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface OptionGroup {
  label: string;
  options: OptionItem[];
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

// Domain CMS Models
export * from './sections';
export * from './page';
export * from './navigation';
export * from './site-settings';
export * from './cms-modules';
export * from './contact-message';

