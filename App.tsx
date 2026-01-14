import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { Student, Group } from './types';
import { generateSampleNames } from './services/geminiService';
import { 
  Users, 
  Settings, 
  Wand2, 
  Trash2, 
  Download, 
  Copy, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [inputText, setInputText] = useState<string>('');
  const [groupCount, setGroupCount] = useState<number>(2);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Helper to show temporary notification
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Generate Sample Data using Gemini
  const handleAiFill = async () => {
    setIsAiLoading(true);
    try {
      const names = await generateSampleNames(30);
      if (names.length > 0) {
        setInputText(prev => {
          const current = prev.trim();
          return current ? `${current}\n${names.join('\n')}` : names.join('\n');
        });
        showNotification(`${names.length}개의 샘플 이름이 추가되었습니다.`);
      } else {
        showNotification('샘플 데이터를 가져오는데 실패했습니다.', 'error');
      }
    } catch (error) {
      showNotification('AI 서비스 연결에 문제가 발생했습니다.', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Clear Input
  const handleClear = () => {
    if (confirm('모든 입력 데이터를 지우시겠습니까?')) {
      setInputText('');
      setGroups([]);
    }
  };

  // Sorting Logic
  const handleSort = () => {
    const lines = inputText.trim().split('\n');
    const validNames = lines
      .map(line => line.trim())
      .filter(name => name.length > 0);

    if (validNames.length === 0) {
      showNotification('학생 이름을 입력해주세요.', 'error');
      return;
    }

    if (groupCount < 1) {
      showNotification('반 개수는 1개 이상이어야 합니다.', 'error');
      return;
    }

    setIsGenerating(true);

    // Simulate thinking/processing for better UX
    setTimeout(() => {
      // 1. Create Student Objects
      const students: Student[] = validNames.map((name, index) => ({
        id: `student-${index}-${Date.now()}`,
        name
      }));

      // 2. Fisher-Yates Shuffle
      const shuffled = [...students];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // 3. Round-Robin Distribution
      const newGroups: Group[] = Array.from({ length: groupCount }, (_, i) => ({
        id: i + 1,
        name: `${i + 1}반`,
        students: []
      }));

      shuffled.forEach((student, index) => {
        const groupIndex = index % groupCount;
        newGroups[groupIndex].students.push(student);
      });

      setGroups(newGroups);
      setIsGenerating(false);
      showNotification(`${validNames.length}명의 학생을 ${groupCount}개 반으로 편성했습니다.`);
    }, 600);
  };

  // Export to Clipboard
  const copyToClipboard = () => {
    if (groups.length === 0) return;
    
    let textOutput = '';
    groups.forEach(group => {
      textOutput += `[${group.name}] (${group.students.length}명)\n`;
      textOutput += group.students.map(s => s.name).join(', ');
      textOutput += '\n\n';
    });

    navigator.clipboard.writeText(textOutput).then(() => {
      showNotification('결과가 클립보드에 복사되었습니다.');
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center transform transition-all duration-300 ease-in-out ${
            notification.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls & Input */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Settings Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="font-semibold flex items-center text-slate-700">
                  <Settings className="w-4 h-4 mr-2" />
                  설정
                </h2>
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <label htmlFor="groupCount" className="block text-sm font-medium text-slate-700 mb-2">
                    반 개수: <span className="text-blue-600 font-bold text-lg">{groupCount}</span>개
                  </label>
                  <input
                    type="range"
                    id="groupCount"
                    min="2"
                    max="20"
                    step="1"
                    value={groupCount}
                    onChange={(e) => setGroupCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>2개</span>
                    <span>20개</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px] lg:h-auto">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="font-semibold flex items-center text-slate-700">
                  <Users className="w-4 h-4 mr-2" />
                  학생 명단
                </h2>
                <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded">
                   {inputText.trim() ? inputText.trim().split('\n').length : 0}명
                </div>
              </div>
              
              <div className="flex-1 p-0 relative">
                <textarea
                  className="w-full h-full min-h-[300px] p-4 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50 text-slate-700 text-sm leading-relaxed"
                  placeholder={`이름을 입력하세요 (엔터로 구분)
예시:
김철수
이영희
박지민
...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
                <Button 
                  variant="secondary" 
                  onClick={handleAiFill} 
                  isLoading={isAiLoading}
                  className="w-full text-xs sm:text-sm"
                  icon={<Wand2 className="w-4 h-4" />}
                >
                  AI 자동채우기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClear}
                  className="w-full text-xs sm:text-sm text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  비우기
                </Button>
              </div>
            </div>

            <Button 
              onClick={handleSort} 
              isLoading={isGenerating}
              className="w-full h-12 text-lg shadow-lg shadow-blue-500/20"
            >
              반 편성 시작하기
            </Button>
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                편성 결과
                {groups.length > 0 && <span className="ml-2 text-sm font-normal text-slate-500">({groups.length}개 반)</span>}
              </h2>
              
              {groups.length > 0 && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} icon={<Copy className="w-4 h-4"/>}>
                    복사
                  </Button>
                </div>
              )}
            </div>

            {groups.length === 0 ? (
              <div className="h-96 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-lg font-medium">아직 편성된 결과가 없습니다</p>
                <p className="text-sm">왼쪽에서 학생 명단을 입력하고 시작하세요</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {groups.map((group) => (
                  <div 
                    key={group.id} 
                    className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200 flex flex-col overflow-hidden"
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 flex justify-between items-center">
                      <h3 className="text-white font-bold text-lg">{group.name}</h3>
                      <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                        {group.students.length}명
                      </span>
                    </div>
                    <div className="p-5 flex-1">
                      <ul className="space-y-2">
                        {group.students.map((student, idx) => (
                          <li key={student.id} className="flex items-center text-sm text-slate-700 p-2 rounded hover:bg-slate-50 transition-colors">
                            <span className="w-6 text-slate-400 text-xs font-mono">{idx + 1}.</span>
                            <span className="font-medium">{student.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
