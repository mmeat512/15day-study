"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { BookOpen, Users, CheckCircle, TrendingUp, MessageSquare, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Stock Study
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/guide">
                <Button variant="ghost">사용 설명서</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost">로그인</Button>
              </Link>
              <Link href="/register">
                <Button>시작하기</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4" />
            <span>15일 완성 주식 공부 플랫폼</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            친구들과 함께하는
            <br />
            <span className="text-blue-600 dark:text-blue-400">15일 주식 스터디</span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            혼자 공부하기 어려운 주식 투자, 이제 친구들과 함께 15일 동안
            체계적으로 배워보세요. 매일 과제와 피드백으로 성장하는 즐거움을 경험하세요!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 py-6">
                무료로 시작하기 →
              </Button>
            </Link>
            <Link href="/guide">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                사용법 알아보기
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">15일</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">완성 프로그램</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">3+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">활성 스터디</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">10+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">누적 사용자</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              이런 기능이 있어요
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              체계적인 학습을 위한 모든 기능을 갖췄습니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  스터디 그룹 생성
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  친구들과 함께 스터디 그룹을 만들고 초대 코드로 간편하게 참여하세요.
                  최대 50명까지 함께 공부할 수 있어요.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  매일 과제 제공
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  15일 동안 매일 체계적인 학습 과제를 받아보세요.
                  각 Day마다 학습 목표와 과제가 준비되어 있습니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  과제 제출 & 확인
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  학습한 내용을 과제로 제출하고, 진행 상황을 실시간으로 확인하세요.
                  자동으로 진행률이 계산됩니다.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  댓글 & 피드백
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  친구들의 과제에 댓글을 달고 서로 피드백을 주고받으세요.
                  함께 성장하는 즐거움을 느껴보세요.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  진행 상황 추적
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  대시보드에서 내 학습 진행률과 통계를 한눈에 확인하세요.
                  완료한 과제와 받은 댓글을 확인할 수 있어요.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  학습 자료 관리
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  책과 연계된 체계적인 학습 플랜으로 공부하세요.
                  각 Day마다 챕터 정보와 학습 목표가 제공됩니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              이렇게 사용하세요
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              간단한 3단계로 시작할 수 있어요
            </p>
          </div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  회원가입 & 로그인
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  이메일과 사용자명으로 간편하게 회원가입하고 로그인하세요.
                  이메일 또는 사용자명으로 로그인할 수 있어요.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  스터디 만들기 또는 참여하기
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  새로운 스터디를 만들거나 친구에게 받은 초대 코드로 참여하세요.
                  최대 50명까지 함께 공부할 수 있습니다.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0 w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  매일 과제하고 성장하기
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  15일 동안 매일 과제를 완료하고 친구들과 피드백을 주고받으세요.
                  꾸준한 학습으로 주식 투자 실력을 키워보세요!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            지금 바로 시작하세요!
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            무료로 회원가입하고 친구들과 함께 주식 공부를 시작해보세요.
            15일 후, 당신의 투자 실력이 달라집니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                무료 회원가입 →
              </Button>
            </Link>
            <Link href="/guide">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 text-white border-white hover:bg-white/10">
                자세한 사용법 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold text-white">Stock Study 15-Day Tracker</span>
          </div>
          <p className="mb-4">친구들과 함께 성장하는 15일 주식 스터디 플랫폼</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/guide" className="hover:text-white transition-colors">
              사용 설명서
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              로그인
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              회원가입
            </Link>
          </div>
          <p className="mt-8 text-sm">
            © 2025 Stock Study. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
