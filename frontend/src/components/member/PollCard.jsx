import { useState } from 'react';
import { Vote, CheckCircle2, Loader2, Send, Users, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { pollService } from '../../utils/request';

const PollCard = ({ poll, onVoted }) => {
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const hasVoted = poll.user_vote?.has_voted;
  const votedOptionId = poll.user_vote?.option_id;
  const totalVotes = Number(poll.total_votes) || 0;

  const handleVote = async () => {
    if (!selectedOptionId) {
      toast.error('Silakan pilih salah satu jawaban terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      await pollService.vote(poll.id, selectedOptionId);
      toast.success('Terima kasih! Suara Anda berhasil tercatat.');
      if (onVoted) {
        onVoted(poll.id, selectedOptionId);
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengirim suara.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 border border-indigo-500/20 dark:border-white/10 shadow-md sm:shadow-lg p-4 sm:p-6 transition-all">
      {/* Decorative ambient gradient */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
          <Vote size={13} />
          {poll.title || 'Polling'}
        </span>

        {hasVoted ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-500/20">
            <CheckCircle2 size={13} />
            Sudah Diisi
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
            <Sparkles size={12} />
            Pilih Salah Satu Jawaban
          </span>
        )}
      </div>

      {/* Question */}
      <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
        {poll.question}
      </h3>
      {poll.description && (
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
          {poll.description}
        </p>
      )}

      {/* Options Body */}
      <div className="mt-4 sm:mt-5 space-y-2.5">
        {hasVoted ? (
          // ================= VIEW RESULTS MODE =================
          poll.options?.map((opt, idx) => {
            const isUserChoice = opt.id === votedOptionId;
            const pct = opt.percentage || 0;
            const count = Number(opt.vote_count) || 0;

            return (
              <div
                key={opt.id}
                className={`relative overflow-hidden p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all ${
                  isUserChoice
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-500/10 ring-2 ring-indigo-500/30'
                    : 'border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-gray-800/40'
                }`}
              >
                {/* Background animated progress bar */}
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                    isUserChoice ? 'bg-indigo-500/20' : 'bg-gray-200/50 dark:bg-gray-700/30'
                  }`}
                  style={{ width: `${pct}%` }}
                />

                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                          isUserChoice
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-xs sm:text-sm leading-snug break-words ${
                            isUserChoice
                              ? 'font-bold text-indigo-900 dark:text-indigo-200'
                              : 'font-medium text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {opt.option_text}
                        </span>
                        {isUserChoice && (
                          <div className="mt-1">
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                              Pilihan Anda
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 text-right">
                      <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                        {count} suara
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white min-w-[34px]">
                        {pct}%
                      </span>
                    </div>
                  </div>

                  {/* Foreground Progress Indicator */}
                  <div className="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // ================= VOTING MODE =================
          poll.options?.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOptionId(opt.id)}
                className={`w-full text-left p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all flex items-start justify-between gap-3 group active:scale-[0.99] ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'border-gray-200 dark:border-white/10 bg-gray-50/70 dark:bg-gray-800/40 hover:border-indigo-400 dark:hover:border-indigo-500/40'
                }`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-bold transition flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-white/10 text-gray-600 dark:text-gray-300 group-hover:border-indigo-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className={`text-xs sm:text-sm leading-snug break-words flex-1 ${
                      isSelected
                        ? 'font-semibold text-indigo-900 dark:text-indigo-200'
                        : 'font-medium text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {opt.option_text}
                  </span>
                </div>

                {/* Radio Circle Indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-indigo-400'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer & Action Button */}
      <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <Users size={14} className="text-indigo-500 flex-shrink-0" />
          <span>{totalVotes} member telah memberikan suara</span>
        </span>

        {!hasVoted && (
          <button
            type="button"
            onClick={handleVote}
            disabled={!selectedOptionId || submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Mengirim Suara...
              </>
            ) : (
              <>
                <Send size={15} />
                Kirim Pilihan Saya
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PollCard;
