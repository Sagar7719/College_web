// 14 Approved Predefined Page Builder Section Types

export type SectionType =
  | 'hero'
  | 'heading'
  | 'richtext'
  | 'image'
  | 'imageText'
  | 'twoColumn'
  | 'threeColumn'
  | 'cardGrid'
  | 'cta'
  | 'faq'
  | 'noticeList'
  | 'documentDownloads'
  | 'gallery'
  | 'spacer';

export interface BaseSection {
  id: string;
  type: SectionType;
  visible?: boolean;
}

export interface HeroSection extends BaseSection {
  type: 'hero';
  title: string;
  subtitle?: string;
  backgroundImageUrl?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

export interface HeadingSection extends BaseSection {
  type: 'heading';
  title: string;
  subtitle?: string;
  level: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center' | 'right';
}

export interface RichTextSection extends BaseSection {
  type: 'richtext';
  content: string; // HTML string
}

export interface ImageSection extends BaseSection {
  type: 'image';
  imageUrl: string;
  altText?: string;
  caption?: string;
  alignment?: 'left' | 'center' | 'right';
  widthMode?: 'full' | 'contained';
}

export interface ImageTextSection extends BaseSection {
  type: 'imageText';
  title: string;
  content: string;
  imageUrl: string;
  imagePosition: 'left' | 'right';
  altText?: string;
}

export interface TwoColumnSection extends BaseSection {
  type: 'twoColumn';
  col1Content: string;
  col2Content: string;
}

export interface ThreeColumnSection extends BaseSection {
  type: 'threeColumn';
  col1Content: string;
  col2Content: string;
  col3Content: string;
}

export interface CardItem {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkText?: string;
}

export interface CardGridSection extends BaseSection {
  type: 'cardGrid';
  title?: string;
  cards: CardItem[];
  columns?: 2 | 3 | 4;
}

export interface CTASection extends BaseSection {
  type: 'cta';
  title: string;
  description?: string;
  buttonLabel: string;
  buttonUrl: string;
  variant?: 'navy' | 'light';
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQSection extends BaseSection {
  type: 'faq';
  title?: string;
  items: FAQItem[];
}

export interface NoticeListSection extends BaseSection {
  type: 'noticeList';
  title?: string;
  categoryLimit?: string;
  maxCount?: number;
}

export interface DocumentDownloadsSection extends BaseSection {
  type: 'documentDownloads';
  title?: string;
  /** Optional: filter by category from the Downloads CMS collection */
  categoryFilter?: string;
  documentIds?: string[];
}

export interface GallerySection extends BaseSection {
  type: 'gallery';
  title?: string;
  /** ID or slug of a Gallery Album from the Gallery CMS collection */
  albumId?: string;
  /** Fallback: static image URLs if no album is selected */
  imageUrls?: string[];
}

export interface SpacerSection extends BaseSection {
  type: 'spacer';
  height: 'sm' | 'md' | 'lg'; // 24px, 48px, 96px
}

export type PageSection =
  | HeroSection
  | HeadingSection
  | RichTextSection
  | ImageSection
  | ImageTextSection
  | TwoColumnSection
  | ThreeColumnSection
  | CardGridSection
  | CTASection
  | FAQSection
  | NoticeListSection
  | DocumentDownloadsSection
  | GallerySection
  | SpacerSection;
