import { DemoTableSection } from './DemoTableSection';
import { persianLabels } from './demo-config';
import './App.css';

function App() {
  return (
    <main className="demo-page">
      <header className="demo-header">
        <h1>rc-table-advanced</h1>
        <p>
          Full-featured demo: search, sort, filter chips, modal filters (all types
          including multi-calendar dates), drawer filters, validation cells, and
          pagination with page size.
        </p>
      </header>

      <DemoTableSection
        description="Default English labels and built-in rcta-* styles. Open Filters to try select, badge, amount range, and Jalali / Miladi / Qamari date pickers."
        dir="ltr"
        title="Default — all features"
      />

      <DemoTableSection
        className="custom-table-root"
        classNames={{
          root: 'custom-table-root',
          filterWrapper: 'custom-filter',
          filterBar: 'custom-filter__bar',
          filterSearch: 'custom-filter__search',
          filterChips: 'custom-filter__chips',
          tableWrapper: 'custom-table',
          pagination: 'custom-pagination',
          modalOverlay: 'custom-modal-overlay',
          modalPanel: 'custom-modal',
          drawerPanel: 'custom-drawer',
        }}
        description="همهٔ متن‌ها فارسی و چیدمان کامل RTL: فیلترها، مودال، کشو، جدول و صفحه‌بندی."
        labels={persianLabels}
        dir="rtl"
        title="نمونه فارسی — RTL کامل"
      />
    </main>
  );
}

export default App;
