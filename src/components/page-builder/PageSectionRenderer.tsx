import React from 'react';
import { PageSection } from '@/types';
import {
  HeroBlock,
  HeadingBlock,
  RichTextBlock,
  ImageBlock,
  ImageTextBlock,
  TwoColumnBlock,
  ThreeColumnBlock,
  CardGridBlock,
  CTABlock,
  FAQBlock,
  NoticeListBlock,
  DocumentDownloadsBlock,
  GalleryBlock,
  SpacerBlock,
} from './blocks/Blocks';
import { EmptyState } from '@/components/ui';

export interface PageSectionRendererProps {
  sections: PageSection[];
}

export const PageSectionRenderer: React.FC<PageSectionRendererProps> = ({ sections }) => {
  if (!sections || sections.length === 0) {
    return (
      <EmptyState
        title="Page Content Coming Soon"
        description="This dynamic page has been created and published. Detailed content sections will be added shortly."
      />
    );
  }

  return (
    <div className="page-sections-container">
      {sections.map((section) => {
        if (section.visible === false) return null;

        switch (section.type) {
          case 'hero':
            return <HeroBlock key={section.id} section={section} />;
          case 'heading':
            return <HeadingBlock key={section.id} section={section} />;
          case 'richtext':
            return <RichTextBlock key={section.id} section={section} />;
          case 'image':
            return <ImageBlock key={section.id} section={section} />;
          case 'imageText':
            return <ImageTextBlock key={section.id} section={section} />;
          case 'twoColumn':
            return <TwoColumnBlock key={section.id} section={section} />;
          case 'threeColumn':
            return <ThreeColumnBlock key={section.id} section={section} />;
          case 'cardGrid':
            return <CardGridBlock key={section.id} section={section} />;
          case 'cta':
            return <CTABlock key={section.id} section={section} />;
          case 'faq':
            return <FAQBlock key={section.id} section={section} />;
          case 'noticeList':
            return <NoticeListBlock key={section.id} section={section} />;
          case 'documentDownloads':
            return <DocumentDownloadsBlock key={section.id} section={section} />;
          case 'gallery':
            return <GalleryBlock key={section.id} section={section} />;
          case 'spacer':
            return <SpacerBlock key={section.id} section={section} />;
          default:
            return null;
        }
      })}
    </div>
  );
};
