'use client';

import React, { useState } from 'react';
import styles from './SectionBlocks.module.css';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQAccordion: React.FC<{ items: FAQItem[] }> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={styles.faqBlock}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
            <button
              className={styles.faqQuestionBtn}
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.id}`}
              id={`faq-btn-${item.id}`}
            >
              <span className={styles.faqQuestionText}>{item.question}</span>
              <span className={styles.faqIcon} aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <div
              id={`faq-answer-${item.id}`}
              className={styles.faqAnswerContainer}
              role="region"
              aria-labelledby={`faq-btn-${item.id}`}
              style={{ display: isOpen ? 'block' : 'none' }}
            >
              <p className={styles.faqAnswer}>{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
