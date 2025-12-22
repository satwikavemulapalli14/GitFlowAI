import { useState, useEffect } from 'react';
import api from '../api/axios';
import HealthCheck from '../components/HealthCheck';

export default function Home() {
  const [serverStatus, setServerStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    api
      .get('/health')
      .then(() => {
        if (!cancelled) setServerStatus('connected');
      })
      .catch(() => {
        if (!cancelled) setServerStatus('disconnected');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <main className="text-center max-w-2xl">
        {/* Logo / Title */}
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          GitFlowAI
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          AI-powered GitHub Pull Request Reviewer
        </p>

        {/* Status badge */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              serverStatus === 'connected'
                ? 'bg-green-500'
                : serverStatus === 'disconnected'
                ? 'bg-red-500'
                : 'bg-yellow-500 animate-pulse'
            }`}
          />
          <span className="text-sm font-medium text-gray-500">
            {serverStatus === 'connected'
              ? 'Backend connected'
              : serverStatus === 'disconnected'
              ? 'Backend unreachable'
              : 'Connecting…'}
          </span>
        </div>

        {/* Feature placeholder cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            { title: 'Analyze PRs', desc: 'AI reviews your pull requests automatically' },
            { title: 'Smart Suggestions', desc: 'Actionable feedback on code quality & security' },
            { title: 'GitHub Integration', desc: 'Seamless OAuth and webhook setup' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-base font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Health check detail */}
        <div className="mt-10">
          <HealthCheck />
        </div>
      </main>
    </div>
  );
}
