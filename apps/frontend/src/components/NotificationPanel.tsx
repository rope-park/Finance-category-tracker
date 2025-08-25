import React, { useEffect, useState } from 'react';
import type { Notification } from '../types';

// 알림 API 호출 함수 (임시, 실제 api.ts에 추가 필요)
async function fetchNotifications(): Promise<Notification[]> {
	const token = localStorage.getItem('auth_token');
	const res = await fetch('http://localhost:3001/api/notifications', {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	const data = await res.json();
	return data.data || [];
}

async function markNotificationRead(id: string) {
	const token = localStorage.getItem('auth_token');
	await fetch(`http://localhost:3001/api/notifications/${id}/read`, {
		method: 'PATCH',
		headers: { 'Authorization': `Bearer ${token}` }
	});
}

async function deleteNotification(id: string) {
	const token = localStorage.getItem('auth_token');
	await fetch(`http://localhost:3001/api/notifications/${id}`, {
		method: 'DELETE',
		headers: { 'Authorization': `Bearer ${token}` }
	});
}

const NotificationPanel: React.FC = () => {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [selected, setSelected] = useState<Notification | null>(null);
	const [loading, setLoading] = useState(false);

	const load = async () => {
		setLoading(true);
		setNotifications(await fetchNotifications());
		setLoading(false);
	};

	useEffect(() => { load(); }, []);

	const handleRead = async (id: string) => {
		await markNotificationRead(id);
		await load();
	};
	const handleDelete = async (id: string) => {
		await deleteNotification(id);
		setSelected(null);
		await load();
	};

	return (
		<div className="max-w-lg p-4 mx-auto">
			<h2 className="mb-2 text-lg font-bold">알림/경고 내역</h2>
			{loading ? <div>로딩 중...</div> : notifications.length === 0 ? <div>알림이 없습니다.</div> : (
				<ul className="divide-y divide-gray-200">
					{notifications.map(n => (
						<li key={n.id} className={`flex items-center py-2 ${(n.is_read ?? false) ? 'opacity-60' : ''}`}>
							<button className="flex-1 text-left" onClick={() => setSelected(n)}>
								<span className="font-medium">[{n.type}]</span> {n.message}
								<span className="ml-2 text-xs text-gray-400">{new Date(n.timestamp).toLocaleString()}</span>
							</button>
							  {!(n.is_read ?? false) && <button className="ml-2 text-blue-500" onClick={() => handleRead(n.id)}>읽음</button>}
							<button className="ml-2 text-red-500" onClick={() => handleDelete(n.id)}>삭제</button>
						</li>
					))}
				</ul>
			)}
			{selected && (
				<div className="p-3 mt-4 border rounded bg-gray-50">
					<div className="mb-2"><b>상세</b></div>
					<div>메시지: {selected.message}</div>
					<div>유형: {selected.type}</div>
					<div>시간: {new Date(selected.timestamp).toLocaleString()}</div>
					<div className="flex gap-2 mt-2">
						<button className="text-blue-600" onClick={() => handleRead(selected.id)}>읽음</button>
						<button className="text-red-600" onClick={() => handleDelete(selected.id)}>삭제</button>
						{/* 예산 초과 경고라면 예산 상세로 이동하는 버튼 예시 */}
						{selected.type === 'warning' && selected.message.includes('예산') && (
							<a href="/budget" className="text-green-600 underline">예산 상세 보기</a>
						)}
						<button className="ml-auto text-gray-500" onClick={() => setSelected(null)}>닫기</button>
					</div>
				</div>
			)}
		</div>
	);
};
export default NotificationPanel;