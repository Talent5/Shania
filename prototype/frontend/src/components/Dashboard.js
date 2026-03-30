import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Activity, Heart, AlertCircle, TrendingUp, User, 
  Droplet, LogOut, History, Clock, FileText, Stethoscope, 
  ChevronRight, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard({ user, onLogout }) {
  const [formData, setFormData] = useState({
    Age: 65, Gender: 'M', AdmissionType: 'EMERGENCY', Insurance: 'Medicare',
    SystolicBP: 120, DiastolicBP: 80, HeartRate: 80, RespRate: 18, SpO2: 96,
    BNP: 500, Creatinine: 1.2, Sodium: 138, Hemoglobin: 12,
    Diabetes: 0, Hypertension: 1, AtrialFib: 0, COPD: 0
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/predict`, formData, {
        withCredentials: true
      });
      setResult(response.data);
      fetchHistory();
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setTimeout(() => onLogout(), 2000);
      } else {
        setError(err.response?.data?.error || 'Failed to fetch prediction.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/history?limit=5`, {
        withCredentials: true
      });
      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      onLogout();
    } catch (err) {
      onLogout();
    }
  };

  const featureImportanceData = [
    { name: 'BNP', value: 0.35 },
    { name: 'Age', value: 0.25 },
    { name: 'Creatinine', value: 0.15 },
    { name: 'Sys BP', value: 0.10 },
    { name: 'Sodium', value: 0.08 },
    { name: 'Heart Rate', value: 0.05 },
  ];

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      
      <!-- Header -->
      <header className="dashboard-header">
        <div className="header-title-container">
          <div className="icon-wrapper">
            <Activity size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h1>ADHF Risk Dashboard</h1>
            <p>Predicting 30-day hospital readmission risk for heart failure patients</p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="user-profile">
            <p className="name">{user.full_name}</p>
            <p className="role">{user.role}</p>
          </div>
          <button onClick={handleLogout} className="secondary-btn" title="Logout">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <!-- Main Grid Layout -->
      <div className="dashboard-grid">
        
        <!-- Left Column: Input Form -->
        <div className="card" style={{ marginBottom: 0 }}>
          <form onSubmit={handleSubmit}>
            
            <!-- Section 1: Demographics -->
            <div className="form-section">
              <h3 className="section-title"><User size={20}/> Demographics & Admission</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Age (years;)</label>
                  <input type="number" name="Age" value={formData.Age} onChange={handleChange} min="18" required />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="Gender" value={formData.Gender} onChange={handleChange}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Admission Type</label>
                  <select name="AdmissionType" value={formData.AdmissionType} onChange={handleChange}?���[ۈ�[YOH�SQT��S�&H��[Y\��[��O��[ۏ���[ۈ�[YOH�T��S���\��[���[ۏ���[ۈ�[YOH�SP�U�H��[X�]�O��[ۏ����[X����]���]��\�Ә[YOH��ܛKYܛ�\���X�[�[��\�[��O�X�[���[X��[YOH�[��\�[��H��[YO^ٛܛQ]K�[��\�[��_Hې�[��O^�[�P�[��_O���[ۈ�[YOH�YYX�\�H��YYX�\�O��[ۏ���[ۈ�[YOH�YYX�ZY��YYX�ZY��[ۏ���[ۈ�[YOH��]�]H���]�]O��[ۏ���[ۈ�[YOH��ݙ\��Y[����ݙ\��Y[���[ۏ���[ۈ�[YOH��[�^H���[�^O��[ۏ����[X����]����]����]����KKH�X�[ۈ���][�KO��]��\�Ә[YOH��ܛK\�X�[ۈ�����\�Ә[YOH��X�[ۋ]]H��X�]�]H�^�O^̌Kψ�][�Yۜ��ς�]��\�Ә[YOH��ܛK\��ȏ��]��\�Ә[YOH��ܛKYܛ�\���X�[��\��X��
[R�O�X�[��[�]\OH��[X�\���[YOH��\��XД��[YO^ٛܛQ]K��\��XДHې�[��O^�[�P�[��_H�\]Z\�Yς��]���]��\�Ә[YOH��ܛKYܛ�\���X�[�X\��X��
[R�O�X�[��[�]\OH��[X�\���[YOH�X\��XД��[YO^ٛܛQ]K�X\��XДHې�[��O^�[�P�[��_H�\]Z\�Yς��]���]��\�Ә[YOH��ܛKYܛ�\���X�[�X\��]H
�JO�X�[��[�]\OH��[X�\���[YOH�X\��]H��[YO^ٛܛQ]K�X\��]_Hې�[��O^�[�P�[��_H�\]Z\�Yς��]���]��\�Ә[YOH��ܛKYܛ�\���X�[��\��]H
�JO�X�[��[�]\OH��[X�\���[YOH��\��]H��[YO^ٛܛQ]K��\��]_Hې�[��O^�[�P�[��_H�\]Z\�Yς��]���]��\�Ә[YOH��ܛKYܛ�\���X�[��̈
	JO�X�[��[�]\OH��[X�\���[YOH��̈��[YO^ٛܛQ]K��̟Hې�[��O^�[�P�[��_HZ[�H��X^H�L��\]Z\�Yς��]����]����]����KKH�X�[ۈΈX��KO��]��\�Ә[YOH��ܛK\�X�[ۈ�����\�Ә[YOH��X�[ۋ]]H����]�^�O^̌KψX�ܘ]ܞH�\�[��ς�]��\�Ә[YOH��ܛK\��ȏ��]��\�Ә[YOH��ܛKYܛ�\���X�[���
��S
HH�X[�[O^�ٛ۝�ZY�	ۛܛX[	���܎��͍
���_O��[�X�]܏��X[��X�[��[�]\OH��[X�\���[YOH�����[YO^ٛܛQ]K���Hې�[��O^�[�P�[��_H�\]Z\�Yς��]���]��\�Ә[YOH��ܛKYܛ�\���X�[�ܙX][�[�H
Y��
O�X�[��[�]\OH��[X�\���\H��H��[YOH�ܙX][�[�H��[YO^ٛܛQ]K�ܙX][�[�_Hې�[��O^�[�P�[��_H�\]Z\�Yς��]���]��\�Ә[YOH��ܛKYܛ�\���X�[���][H
Q\K�
O�X�[��[�]\OH��[X�\���[YOH���][H��[YO^ٛܛQ]K���][_Hې�[��O^�[�P�[��_H�\]Z\�Yς��]���]��\�Ә[YOH��ܛKYܛ�\���X�[�[[��ؚ[�
��
O�X�[��[�]\OH��[X�\���\H��H��[YOH�[[��ؚ[���[YO^ٛܛQ]K�[[��ؚ[�Hې�[��O^�[�P�[��_H�\]Z\�Yς��]����]����]����KKH�X�[ۈ
���[ܘ�Y]Y\�KO��]��\�Ә[YOH��ܛK\�X�[ۈ�����\�Ә[YOH��X�[ۋ]]H���]����H�^�O^̌Kψ�[�X�[\�ܞO�ς�]��\�Ә[YOH��ܛK\��ȏ��]��\�Ә[YOH��ܛKYܛ�\���X�[�XX�]\��X�[���[X��[YOH�XX�]\Ȉ�[YO^ٛܛQ]K�XX�]\�Hې�[��O^�[�P�[��_O���[ۈ�[YO^�O�����[ۏ��[ۈ�[YO^�_O�Y\���[ۏ����[X����]���]��\�Ә[YOH��ܛKYܛ�\���X�[�\\�[��[ۏ�X�[���[X��[YOH�\\�[��[ۈ��[YO^ٛܛQ]K�\\�[��[۟Hې�[��O^�[�P�[��_O���F���f�VS׳�������F������F���f�VS׳��W3���F������6V�V7C���F�c��F�b6�74��S�&f�&��w&�W#���&V��G&��f�'&���F������&V���6V�V7B��S�$G&��f�""f�VS׶f�&�FF�G&��f�'���6��vS׶��F�T6��vW����F���f�VS׳�������F������F���f�VS׳��W3���F������6V�V7C���F�c��F�b6�74��S�&f�&��w&�W#���&V��4�C���&V���6V�V7B��S�$4�B"f�VS׶f�&�FF�4�G���6��vS׶��F�T6��vW��(����������������������ѥ���م�Ք�����9���ѥ�����ѥ���م�Ք�����e����ѥ���(�������������������͕�����(����������������𽑥��(��������������𽑥��(������������𽑥��((��������������ɽȀ����(���������������؁��屔��쁉����ɽչ�
����耜����ɔȜ�������耜���ňň����������耜�ɕ������ɑ��I�����耜��������ɝ��Q��耜�ɕ������(���������������������
�ɍ���ͥ��������屔��푥�����蝥����������ɝ��I�����������ٕ�ѥ�������蝵����������(������������������ɽ��(��������������𽑥��(��������������((�������������؁�����9�����Չ��е���х���Ȉ�(�����������������ѽ��������Չ��Ј������9�����Չ��е�Ѹ����ͅ���������������(����������������������������م�Յѥ���5���������������
���ձ�є�I�ͬ�M��ɔ����ɽ�I���Ёͥ�����������(�����������������ѽ��(������������𽑥��(����������𽙽ɴ�(��������𽑥��((�������������I���Ё
��յ��=����Ѐ��!��ѽ�䀴��(���������؁��屔��쁑������耝������������ɕ�ѥ��耝���յ�������耜�ɕ������(����������(���������������Aɕ���ѥ���I��ձЁ	��������(�����������ɕ�ձЀ����(�������������؁�����9�������ɐ�ɕ�ձ�̵��ɐ���ɕ�ձй�ɕ���ѥ������Ā��������ɥͬ��耝��ܵɥͬ������屔��쁵�ɝ��	��ѽ�������(���������������ȁ��屔��쁑������耝������������%ѕ��耝���ѕȜ�����耜��������ɝ��耜�����ɕ��������(�����������������Qɕ�����U��ͥ�����􁍽�����ɕ�ձй�ɕ���ѥ������Ā���������М�耜��Ɍ�Ք���(����������������I�ͬ��͕�͵���(�����������������(��������������(���������������؁�����9�����ɥͬ�������ѽȀ��ɕ�ձй�ɕ���ѥ������Ā���ɥͬ�������耝ɥͬ���ܝ�����屔��홽��M��耜ĸ�ɕ�����(�����������������ɕ�ձй���ͅ���(��������������𽑥��((���������������؁��屔�q쁵�ɝ��耜�ɕ������ѕ������耝���ѕȜ����(�����������������؁��屔��쁉����ɽչ�
����耜��ɔ�������ɑ��I�����耜�������������耜���������ͥѥ��耝ɕ��ѥٔ����ٕə���耝�����������(�������������������؀(����������������������屔���(����������������������ݥ�Ѡ聀��ɕ�ձй�ɽ�������䀨���������(���������������������������ɽչ�
�����ɕ�ձй�ɽ������������Ԁ���������М�耜��Ɍ�Ք���(����������������������������耜������(�����������������������Ʌ�ͥѥ��耝ݥ�Ѡ��́��͔������М(����������������������(��������������������(��������������������������屔�����ͥѥ��耝��ͽ��є�������耜������ѽ�耜�������Ʌ�͙�ɴ耝�Ʌ�ͱ�є�������������������]�����耝������������耜�Ŕ��͈�������M��耜���ɕ������(��������������������I�ͬ�Aɽ����������ɕ�ձй�ɽ�������䀨������ѽ�ᕐ�ĥ��(������������������������(����������������𽑥��(��������������𽑥��((���������������؁��屔��쁵�ɝ��Q��耜�ɕ������(�����������������Ё��屔��쁍����耜������䜰���ɑ��	��ѽ�耜����ͽ������ɔ������������	��ѽ�耜���ɕ����������������ɔ�%����х������(�����������������؁��屔���ݥ�Ѡ耜�������������耜����������ɝ��Q��耜�ɕ������(�������������������I�����ٕͥ
��х�����(���������������������	��
���Ё��ф�확���ɕ%����х����х􁱅����ٕ�ѥ�������ɝ�����ѽ�����ɥ�����������耴�������ѽ�������(�����������������������
��ѕͥ��ɥ����ɽ���͡��Ʌ��̀̈���ɥ齹х��홅�͕��(�����������������������a�́�����յ��Ȉ��������(�����������������������e�́��х-��􉹅��������􉍅ѕ���䈁��屔��홽��M��耜���rem'}} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                        {featureImportanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={yndex < 2 ? '#2563eb' : '#93c5fd'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <!-- History Sidebar -->
          <div className="history-sidebar">
            <h2 className="history-header">
              <History size={20} color="#64748b" /> Recent Evaluations
            </h2>
            <div className="history-list">
              {history.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No previous evaluations.</p>
              ) : (
                history.map((item, index) => (
                  <div key={index} className="history-card">
                    <div className="history-meta">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      <span>{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="history-body">
                      <span className="history-patient">Age: {item.patient_age}</span>
                      <span className=`badge ${item.risk_level === 'High' ? 'badge-high' : 'badge-low'}` style={{fontSize: '0.75rem'}>
                        {(fitem.probability * 100).toFixed(1)}% Risk
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Dashboard;
