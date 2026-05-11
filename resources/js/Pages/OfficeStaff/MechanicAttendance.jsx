import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import OfficeStaffLayout from '../../Layouts/OfficeStaffLayout';

const COLORS = {
  primary: '#0f172a',
  accent: '#c9a227',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  subtext: '#64748b',
  border: '#e2e8f0'
};

export default function MechanicAttendance({ authUser }) {
  return (
    <OfficeStaffLayout title="Mechanic Attendance" authUser={authUser}>
      <AttendanceContent />
    </OfficeStaffLayout>
  );
}

function AttendanceContent() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
  });

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);

    const data = [
      {
        attendance_id: 1,
        user: { firstname: 'Juan', lastname: 'Dela Cruz', unique_id: 'MEC-001' },
        check_in: '08:00:00',
        check_out: '17:00:00',
        hours_worked: 9,
        status: 'present',
      },
      {
        attendance_id: 2,
        user: { firstname: 'Maria', lastname: 'Santos', unique_id: 'MEC-002' },
        check_in: '08:30:00',
        check_out: null,
        hours_worked: null,
        status: 'late',
      },
      {
        attendance_id: 3,
        user: { firstname: 'Pedro', lastname: 'Garcia', unique_id: 'MEC-003' },
        check_in: null,
        check_out: null,
        hours_worked: null,
        status: 'absent',
      },
    ];

    setAttendanceRecords(data);

    setStats({
      total: data.length,
      present: data.filter(d => d.status === 'present').length,
      late: data.filter(d => d.status === 'late').length,
      absent: data.filter(d => d.status === 'absent').length,
    });

    setLoading(false);
  };

  const formatTime = (time) => {
    if (!time) return '--';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatus = (status) => {
    const styles = {
      present: { bg: '#ecfdf5', color: '#065f46' },
      late: { bg: '#fffbeb', color: '#92400e' },
      absent: { bg: '#fef2f2', color: '#7f1d1d' },
    };

    const s = styles[status];

    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        background: s.bg,
        color: s.color
      }}>
        {status}
      </span>
    );
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '6px',
    border: `1px solid ${COLORS.border}`,
    fontSize: '13px'
  };

  return (
    <>
      <Head title="Mechanic Attendance" />

      <div style={{
        padding: '20px 28px',
        background: COLORS.bg,
        minHeight: '100vh'
      }}>

        {/* HEADER */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '26px', color: COLORS.primary }}>Mechanic Attendance</h1>
          <p style={{ fontSize: '13px', color: COLORS.subtext }}>
            Monitor daily attendance records
          </p>
        </div>

        {/* STATS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {[
            { label: 'Total', value: stats.total },
            { label: 'Present', value: stats.present },
            { label: 'Late', value: stats.late },
            { label: 'Absent', value: stats.absent },
          ].map((s, i) => (
            <div key={i} style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: '10px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: COLORS.subtext }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* CONTROLS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={inputStyle}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={fetchAttendance} style={btnPrimary}>
              ⟳ Refresh
            </button>

            <button onClick={() => setOpenModal(true)} style={btnAccent}>
              + Add
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div style={{
          background: COLORS.card,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '10px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f1f5f9' }}>
              <tr>
                {['Name', 'ID', 'In', 'Out', 'Hours', 'Status'].map(h => (
                  <th key={h} style={th}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {attendanceRecords.map(r => (
                <tr key={r.attendance_id}>
                  <td style={td}>{r.user.firstname} {r.user.lastname}</td>
                  <td style={td}>{r.user.unique_id}</td>
                  <td style={td}>{formatTime(r.check_in)}</td>
                  <td style={td}>{formatTime(r.check_out)}</td>
                  <td style={td}>{r.hours_worked || '--'}</td>
                  <td style={td}>{getStatus(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {openModal && (
          <div style={modalOverlay}>
            <div style={modalBox}>
              <h3>Add Attendance</h3>

              <input placeholder="Mechanic ID" style={inputStyle} />
              <input type="time" style={inputStyle} />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button onClick={() => setOpenModal(false)} style={btnGhost}>
                  Cancel
                </button>

                <button style={btnPrimary}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

/* STYLES */
const th = {
  padding: '12px',
  textAlign: 'left',
  fontSize: '12px',
  color: '#64748b'
};

const td = {
  padding: '12px',
  borderTop: '1px solid #e2e8f0',
  fontSize: '13px'
};

const btnPrimary = {
  background: '#0f172a',
  color: '#fff',
  border: 'none',
  padding: '8px 14px',
  borderRadius: '6px',
  cursor: 'pointer'
};

const btnAccent = {
  background: '#c9a227',
  color: '#000',
  border: 'none',
  padding: '8px 14px',
  borderRadius: '6px',
  cursor: 'pointer'
};

const btnGhost = {
  background: 'transparent',
  border: '1px solid #e2e8f0',
  padding: '8px 14px',
  borderRadius: '6px',
  cursor: 'pointer'
};

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const modalBox = {
  background: '#fff',
  padding: '20px',
  borderRadius: '10px',
  width: '320px'
};