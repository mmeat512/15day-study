"use client";

import Link from "next/link";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  BookOpen,
  Home,
  UserPlus,
  LogIn,
  LayoutDashboard,
  Plus,
  Users,
  User,
  HelpCircle,
  Target,
  Calendar,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="border-b bg-white dark:bg-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Stock Study
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost">
                  <Home className="h-4 w-4 mr-2" />
                  홈으로
                </Button>
              </Link>
              <Link href="/login">
                <Button>로그인</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            📚 Stock Study 사용 설명서
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            초등학생도 쉽게 따라할 수 있는 친절한 사용법!
          </p>
        </div>

        {/* Quick Links */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>빠른 링크</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="#what-is-this" className="text-blue-600 hover:underline">
                🎯 서비스 소개
              </a>
              <a href="#register" className="text-blue-600 hover:underline">
                📝 회원가입
              </a>
              <a href="#login" className="text-blue-600 hover:underline">
                🔑 로그인
              </a>
              <a href="#dashboard" className="text-blue-600 hover:underline">
                🏠 대시보드
              </a>
              <a href="#create-study" className="text-blue-600 hover:underline">
                📚 스터디 만들기
              </a>
              <a href="#join-study" className="text-blue-600 hover:underline">
                🤝 스터디 참여
              </a>
              <a href="#mypage" className="text-blue-600 hover:underline">
                👤 마이페이지
              </a>
              <a href="#faq" className="text-blue-600 hover:underline">
                ❓ 자주 묻는 질문
              </a>
            </div>
          </CardContent>
        </Card>

        {/* What is this */}
        <section id="what-is-this" className="mb-12 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-blue-600" />
                이 앱은 뭐하는 거예요?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                <strong>Stock Study 15-Day Tracker</strong>는 친구들과 함께 주식 공부를
                15일 동안 하는 걸 도와주는 웹사이트예요!
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">친구들과 스터디 그룹 만들기</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      같이 공부할 친구들을 모을 수 있어요
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">매일 과제 받기</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      15일 동안 매일 할 일을 알려줘요
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">과제 제출하기</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      공부한 내용을 올릴 수 있어요
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">진행 상황 보기</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      내가 얼마나 했는지 확인할 수 있어요
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Register */}
        <section id="register" className="mb-12 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-6 w-6 text-blue-600" />
                회원가입 하는 방법
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>처음 사용하는 사람은 계정을 만들어야 해요. 걱정하지 마세요, 정말 쉬워요!</p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">회원가입 페이지로 가기</h4>
                    <Link href="/register">
                      <Button variant="outline" size="sm">
                        회원가입 페이지로 이동 <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      또는 주소창에 <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">http://localhost:3090/register</code> 입력
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">정보 입력하기</h4>
                    <ul className="space-y-2 text-sm">
                      <li>📧 <strong>이메일</strong>: 내 이메일 주소 (예: hongkildong@example.com)</li>
                      <li>👤 <strong>사용자명</strong>: 친구들에게 보일 별명 (세상에 하나뿐!)</li>
                      <li>🔒 <strong>비밀번호</strong>: 최소 6글자 이상</li>
                      <li>🔒 <strong>비밀번호 확인</strong>: 위에 쓴 비밀번호를 똑같이 한번 더</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">회원가입 버튼 누르기</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      모든 칸을 채웠으면 "회원가입" 버튼을 눌러요!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">완료!</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ✅ 성공하면 로그인 페이지로 자동으로 이동해요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
                <p className="font-semibold mb-2">💡 팁</p>
                <ul className="space-y-1 text-sm">
                  <li>• 이메일은 나중에 비밀번호를 잊어버렸을 때 필요해요</li>
                  <li>• 사용자명은 나중에 바꿀 수 없으니 신중하게 정해요</li>
                  <li>• 비밀번호는 꼭 기억해야 해요! 메모해두면 좋아요</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Login */}
        <section id="login" className="mb-12 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-6 w-6 text-blue-600" />
                로그인 하는 방법
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>계정을 만들었으면 이제 로그인할 차례예요!</p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">로그인 페이지로 가기</h4>
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        로그인 페이지로 이동 <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">정보 입력하기</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                        <p className="font-semibold text-sm mb-1">방법 1: 이메일로 로그인</p>
                        <p className="text-sm">이메일과 비밀번호를 입력하세요</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                        <p className="font-semibold text-sm mb-1">방법 2: 사용자명으로 로그인</p>
                        <p className="text-sm">사용자명과 비밀번호를 입력하세요</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">완료!</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ✅ 성공하면 대시보드 페이지로 자동으로 이동해요.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dashboard */}
        <section id="dashboard" className="mb-12 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-blue-600" />
                대시보드 사용하기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>로그인하면 제일 먼저 보이는 화면이 <strong>대시보드</strong>예요. 여기서 오늘 할 일과 진행 상황을 한눈에 볼 수 있어요!</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📊 스터디 개요 카드</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 스터디 이름과 책 제목</li>
                    <li>• 시작/종료 날짜</li>
                    <li>• 진행률 (퍼센트)</li>
                    <li>• 초대 코드</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📈 내 통계</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 총 제출 횟수</li>
                    <li>• 현재 Day</li>
                    <li>• 진행률</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📝 오늘의 과제</h4>
                <p className="text-sm">
                  아래쪽에 오늘 해야 할 과제가 나와요. "Start Assignment" 버튼을 누르면 과제를 시작할 수 있어요!
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Create Study */}
        <section id="create-study" className="mb-12 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-6 w-6 text-blue-600" />
                스터디 만들기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>친구들과 함께 공부할 새로운 스터디 그룹을 만들어볼까요?</p>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-2">📌 필수 정보</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>스터디 이름</strong>: 친구들이 알아볼 수 있는 이름</li>
                    <li>• <strong>책 제목</strong>: 같이 공부할 책 이름</li>
                    <li>• <strong>시작/종료 날짜</strong>: 15일 프로그램</li>
                    <li>• <strong>최대 인원</strong>: 2~50명까지 가능</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="font-semibold mb-2">✅ 스터디 생성 후</p>
                  <p className="text-sm">
                    초대 코드를 받아요! 이 코드를 친구들에게 알려주세요.
                  </p>
                </div>
              </div>

              <Link href="/studies/create">
                <Button className="w-full">
                  스터디 만들러 가기 <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Join Study */}
        <section id="join-study" className="mb-12 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                스터디에 참여하기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>친구가 만든 스터디에 참여하고 싶나요? 초대 코드만 있으면 쉽게 참여할 수 있어요!</p>

              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📋 필요한 것</h4>
                  <p className="text-sm">
                    친구에게 받은 <strong>초대 코드</strong> (예: ABC12345)
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <p><strong>1.</strong> 스터디 참여 페이지로 이동</p>
                  <p><strong>2.</strong> 초대 코드 입력 (대소문자 주의!)</p>
                  <p><strong>3.</strong> "Join Study" 버튼 클릭</p>
                  <p><strong>4.</strong> 완료! 🎉</p>
                </div>
              </div>

              <Link href="/studies/join">
                <Button className="w-full">
                  스터디 참여하러 가기 <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* MyPage */}
        <section id="mypage" className="mb-12 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                마이페이지 확인하기
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>내 프로필과 활동 내역을 확인할 수 있는 곳이에요!</p>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">👤 프로필 카드</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 사용자명</li>
                    <li>• 이메일</li>
                    <li>• 가입일</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📊 통계 카드</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• 참여 중인 스터디</li>
                    <li>• 완료한 과제</li>
                    <li>• 평균 진행률</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">📚 스터디 목록</h4>
                  <p className="text-sm">
                    참여하고 있는 모든 스터디 목록과 진행률
                  </p>
                </div>
              </div>

              <Link href="/mypage">
                <Button className="w-full" variant="outline">
                  마이페이지로 가기 <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12 scroll-mt-20">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-blue-600" />
                자주 묻는 질문
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Q: 비밀번호를 잊어버렸어요!</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: 현재는 관리자에게 문의해주세요. 비밀번호 찾기 기능은 곧 추가될 예정입니다.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Q: 사용자명을 바꾸고 싶어요</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: 죄송해요, 한번 정한 사용자명은 바꿀 수 없어요. 새로운 계정을 만들어야 해요.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Q: 과제를 놓쳤어요. 나중에 해도 되나요?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: 네, 가능해요! 이전 날짜의 과제도 언제든 할 수 있어요.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Q: 하루에 여러 개의 스터디에 참여할 수 있나요?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    A: 네! 원하는 만큼 많은 스터디에 참여할 수 있어요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Success Flow */}
        <Card className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle>🎮 전체 사용 흐름 (한눈에 보기)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">1️⃣</div>
                <p className="text-sm font-semibold">회원가입</p>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 md:rotate-0" />
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">2️⃣</div>
                <p className="text-sm font-semibold">로그인</p>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 md:rotate-0" />
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">3️⃣</div>
                <p className="text-sm font-semibold">스터디 참여</p>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 md:rotate-0" />
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">4️⃣</div>
                <p className="text-sm font-semibold">과제 완료</p>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 md:rotate-0" />
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <div className="text-2xl mb-2">🎉</div>
                <p className="text-sm font-semibold">15일 완성!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            이제 시작할 준비가 되셨나요?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                회원가입하고 시작하기 →
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="text-lg px-8">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            질문이나 도움이 필요하시면 언제든 문의해주세요!
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm">
            © 2025 Stock Study 15-Day Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
