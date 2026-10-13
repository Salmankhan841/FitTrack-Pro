import React from 'react';
import { useSelector } from 'react-redux';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import './ReportsPage.css';

const ReportsPage = () => {
  const workouts = useSelector(state => state.workout.workouts);
  const nutrition = useSelector(state => state.nutrition.meals);

  const downloadCSV = (data, filename, type) => {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    if (type === 'workout') {
      csvContent += "Date,Exercise Name,Duration (min),Calories Burned\n";
      data.forEach(item => {
        csvContent += `${item.date},${item.exerciseName},${item.duration},${item.caloriesBurned}\n`;
      });
    } else if (type === 'nutrition') {
      csvContent += "Date,Meal Name,Calories,Protein,Carbs,Fats\n";
      data.forEach(item => {
        csvContent += `${item.date},${item.mealName},${item.calories},${item.protein || 0},${item.carbs || 0},${item.fats || 0}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data, filename, type) => {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const doc = new jsPDF();
    doc.text(`${filename} Report`, 14, 15);

    let head = [];
    let body = [];

    if (type === 'workout') {
      head = [['Date', 'Exercise Name', 'Duration (min)', 'Calories Burned']];
      body = data.map(item => [item.date, item.exerciseName, item.duration, item.caloriesBurned]);
    } else if (type === 'nutrition') {
      head = [['Date', 'Meal Name', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fats (g)']];
      body = data.map(item => [item.date, item.mealName, item.calories, item.protein || 0, item.carbs || 0, item.fats || 0]);
    }

    doc.autoTable({
      startY: 20,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [108, 99, 255] }
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="reports-container" data-aos="fade-in">
      <header className="reports-header">
        <h1>Export Your Data</h1>
        <p>Download your complete workout and nutrition logs in PDF or CSV format.</p>
      </header>

      <div className="reports-grid">
        <Card title="Workout History" className="report-card" data-aos="fade-up" data-aos-delay="0">
          <div className="report-card-content">
            <div className="report-icon">
              <FileText size={48} />
            </div>
            <p>Total logged: {workouts.length} workouts</p>
            <div className="export-actions">
              <Button onClick={() => downloadCSV(workouts, 'workout_history', 'workout')}>
                <FileSpreadsheet size={18} style={{ marginRight: '8px' }} />
                Export CSV
              </Button>
              <Button variant="secondary" onClick={() => downloadPDF(workouts, 'workout_history', 'workout')}>
                <Download size={18} style={{ marginRight: '8px' }} />
                Export PDF
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Nutrition History" className="report-card" data-aos="fade-up" data-aos-delay="100">
          <div className="report-card-content">
            <div className="report-icon">
              <FileText size={48} />
            </div>
            <p>Total logged: {nutrition.length} meals</p>
            <div className="export-actions">
              <Button onClick={() => downloadCSV(nutrition, 'nutrition_history', 'nutrition')}>
                <FileSpreadsheet size={18} style={{ marginRight: '8px' }} />
                Export CSV
              </Button>
              <Button variant="secondary" onClick={() => downloadPDF(nutrition, 'nutrition_history', 'nutrition')}>
                <Download size={18} style={{ marginRight: '8px' }} />
                Export PDF
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
