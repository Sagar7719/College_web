'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  coursesService, 
  departmentsService, 
  facultyService, 
  noticesService, 
  newsService, 
  eventsService 
} from '@/services/cms-modules.service';
import { Course, Department, Faculty, Notice, NewsItem, EventItem } from '@/types';
import { Input, Button, Badge, Card, CardBody, EmptyState, Skeleton } from '@/components/ui';
import styles from '../inner.module.css';

interface SearchResults {
  courses: Course[];
  departments: Department[];
  faculty: Faculty[];
  notices: Notice[];
  news: NewsItem[];
  events: EventItem[];
}

export function SearchClient() {
  const [queryStr, setQueryStr] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    courses: [],
    departments: [],
    faculty: [],
    notices: [],
    news: [],
    events: [],
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = queryStr.trim().toLowerCase();
    if (!q) return;

    setLoading(true);
    setHasSearched(true);

    try {
      const [
        allCourses,
        allDepts,
        allFaculty,
        allNotices,
        allNews,
        allEvents
      ] = await Promise.all([
        coursesService.getPublished().catch(() => []),
        departmentsService.getPublished().catch(() => []),
        facultyService.getPublished().catch(() => []),
        noticesService.getPublished().catch(() => []),
        newsService.getPublished().catch(() => []),
        eventsService.getUpcoming().catch(() => []),
      ]);

      // Filter courses
      const courses = allCourses.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.code.toLowerCase().includes(q) || 
        (item.description || '').toLowerCase().includes(q)
      );

      // Filter departments
      const departments = allDepts.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.code.toLowerCase().includes(q) || 
        (item.description || '').toLowerCase().includes(q)
      );

      // Filter faculty
      const faculty = allFaculty.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.designation.toLowerCase().includes(q) || 
        (item.qualification || '').toLowerCase().includes(q) ||
        (item.departmentName || '').toLowerCase().includes(q)
      );

      // Filter notices
      const notices = allNotices.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.content || '').toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q)
      );

      // Filter news
      const news = allNews.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.summary || '').toLowerCase().includes(q) || 
        (item.content || '').toLowerCase().includes(q)
      );

      // Filter events
      const events = allEvents.filter(item => 
        item.title.toLowerCase().includes(q) || 
        (item.description || '').toLowerCase().includes(q) || 
        (item.venue || '').toLowerCase().includes(q)
      );

      setResults({ courses, departments, faculty, notices, news, events });
    } catch (err) {
      console.error('Search retrieval error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalResultsCount = 
    results.courses.length + 
    results.departments.length + 
    results.faculty.length + 
    results.notices.length + 
    results.news.length + 
    results.events.length;

  return (
    <div className={styles.subpageWrapper}>
      <div className="container">
        <div className={styles.pageHeader}>
          <Badge variant="default" style={{ marginBottom: '0.75rem' }}>Global Search</Badge>
          <h1 className={styles.pageTitle}>Search College Website</h1>
          <p className={styles.pageSubtitle}>
            Find notices, courses, departments, faculty profiles, and news.
          </p>
        </div>

      <Card variant="bordered" style={{ marginBottom: '3rem' }}>
        <CardBody style={{ padding: '1.75rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <Input
                placeholder="Search by keyword (e.g. Admission, Computer Science, Exam)..."
                value={queryStr}
                onChange={(e) => setQueryStr(e.target.value)}
              />
            </div>
            <Button variant="primary" type="submit" style={{ height: '42px', padding: '0 1.5rem' }}>
              Search
            </Button>
          </form>
        </CardBody>
      </Card>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="80px" />
          <Skeleton height="80px" />
          <Skeleton height="80px" />
        </div>
      )}

      {!loading && hasSearched && totalResultsCount === 0 && (
        <EmptyState
          title={`No Results Found for "${queryStr}"`}
          description="Try searching with a different term such as 'Admissions', 'Courses', 'Notices', or 'Faculty'."
        />
      )}

      {!loading && hasSearched && totalResultsCount > 0 && (
        <div>
          <h2 className={styles.sectionTitle} style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>
            Search Results ({totalResultsCount} found)
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Notices */}
            {results.notices.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  📌 Announcements & Notices ({results.notices.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {results.notices.map(notice => (
                    <Card key={notice.id} variant="bordered">
                      <CardBody style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div>
                            <Link href="/notices" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                              {notice.title}
                            </Link>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                              Category: {notice.category} • Published: {new Date(notice.publishDate).toLocaleDateString()}
                            </p>
                          </div>
                          {notice.attachmentUrl && (
                            <a href={notice.attachmentUrl} target="_blank" rel="noopener noreferrer">
                              <Badge variant="info">View Circular 📥</Badge>
                            </a>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {results.courses.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  🎓 Degree Programs & Courses ({results.courses.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {results.courses.map(course => (
                    <Card key={course.id} variant="bordered">
                      <CardBody style={{ padding: '1.25rem' }}>
                        <Badge variant="info" style={{ marginBottom: '0.5rem' }}>{course.degreeType} - {course.code}</Badge>
                        <h4 style={{ fontWeight: 700, margin: '0.25rem 0' }}>{course.title}</h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          Duration: {course.durationYears} Years
                        </p>
                        <div style={{ marginTop: '0.75rem' }}>
                          <Link href="/courses">
                            <Button variant="outline" size="sm">Course Details ➔</Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Departments */}
            {results.departments.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  🏛️ Academic Departments ({results.departments.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {results.departments.map(dept => (
                    <Card key={dept.id} variant="bordered">
                      <CardBody style={{ padding: '1.25rem' }}>
                        <Badge variant="default" style={{ marginBottom: '0.5rem' }}>{dept.code}</Badge>
                        <h4 style={{ fontWeight: 700, margin: '0.25rem 0' }}>{dept.name}</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {dept.description}
                        </p>
                        <div style={{ marginTop: '0.75rem' }}>
                          <Link href={`/courses?dept=${dept.id}`}>
                            <Button variant="outline" size="sm">View Department ➔</Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Faculty */}
            {results.faculty.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  👨‍🏫 Faculty Directory ({results.faculty.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {results.faculty.map(teacher => (
                    <Card key={teacher.id} variant="bordered">
                      <CardBody style={{ padding: '1.25rem' }}>
                        <h4 style={{ fontWeight: 700, margin: 0 }}>{teacher.name}</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>{teacher.designation}</p>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          Dept: {teacher.departmentName} • {teacher.qualification}
                        </p>
                        <div style={{ marginTop: '0.75rem' }}>
                          <Link href="/faculty">
                            <Button variant="outline" size="sm">Faculty Directory ➔</Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {results.events.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  📅 Calendar Events ({results.events.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {results.events.map(event => (
                    <Card key={event.id} variant="bordered">
                      <CardBody style={{ padding: '1.25rem' }}>
                        <Badge variant="warning" style={{ marginBottom: '0.5rem' }}>{new Date(event.eventDate).toLocaleDateString()}</Badge>
                        <h4 style={{ fontWeight: 700, margin: '0.25rem 0' }}>{event.title}</h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          Venue: {event.venue}
                        </p>
                        <div style={{ marginTop: '0.75rem' }}>
                          <Link href="/events">
                            <Button variant="outline" size="sm">View Event ➔</Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* News */}
            {results.news.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', color: 'var(--color-primary)', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                  📰 News & Press Releases ({results.news.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {results.news.map(story => (
                    <Card key={story.id} variant="bordered">
                      <CardBody style={{ padding: '1.25rem' }}>
                        <h4 style={{ fontWeight: 700, margin: '0.25rem 0' }}>{story.title}</h4>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                          Published: {new Date(story.publishDate).toLocaleDateString()}
                        </p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--color-text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {story.summary}
                        </p>
                        <div style={{ marginTop: '0.75rem' }}>
                          <Link href="/news">
                            <Button variant="outline" size="sm">Read Story ➔</Button>
                          </Link>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);
}
