import React, { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import './App.css';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import FullCalendar from "@fullcalendar/react";
import { gapi } from 'gapi-script';
import dayGridPlugin from '@fullcalendar/daygrid';
// import axios from "axios";

function App() {
    //크기 조절
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    const handleResize = debounce(() => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight
        });
    }, 1000);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    //맨 위 배치할 내용
    const TopHandComponent = () => {
        return (
            <div className="topFrame" style={{
                height: 100,
                backgroundColor: 'white',
                borderColor: 'black',
                borderWidth: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                borderStyle: 'solid',
                justifyContent: 'space-between'
            }}>
                <div>
                    <p className="stroeName"
                       style={{ fontSize: 30, lineHeight: '100%', color: 'rgba(124, 110, 20, 1)' }}>공방친구</p>
                </div>
                <div className="search" style={{
                    width: 700,
                    height: 70,
                    top: 35,
                    left: 250,
                    backgroundColor: 'rgba(196, 196, 196, 0)',
                    borderRadius: 9999,
                    borderColor: 'black',
                    borderWidth: 2,
                    borderStyle: 'solid',
                }}>
                    <img className="searchImage"
                         style={{ width: 50, height: 50, borderRadius: 8 }}
                         src="https://via.placeholder.com/50x50" alt="search" />
                </div>
                <div className="profile" style={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <div>
                        <img className="image"
                             style={{ width: 70, height: 70, borderRadius: 9999 }}
                             src="https://via.placeholder.com/70x70" alt="profile" />
                    </div>
                    <div>
                        <p className="name"
                           style={{ width: 165, height: 50, fontSize: 30, lineHeight: '100%', color: 'black' }}>
                            독고순광</p>
                    </div>
                </div>
            </div>
        );
    };

    //카카오톡 로그인전 초기화
    useEffect(() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.REACT_APP_KAKAOTALK_API_KEY);
        console.log('Kakao 초기화 완료');
    }
}, [])

    //카카오톡 로그인
    const handleLoginAndSend = (eventTitle) => {
        console.log('로그인 시도');
        window.Kakao.Auth.login({
            scope: 'talk_message',
            success: (authObj) => {
                console.log('로그인 성공',authObj);
                sendKakaoMessage(eventTitle);
            },
            fail: (err) => {
                console.error('로그인 실패',err);
                alert('로그인 실패');
            }
        });
    };

    //카카오톡 메세지 전송
    const sendKakaoMessage = (eventTitle) => {
        console.log('메시지 전송 시도');
        const accessToken = window.Kakao.Auth.getAccessToken();
        if (window.Kakao && window.Kakao.isInitialized() && window.Kakao.Auth.getAccessToken()) {
            console.log('액세스 토큰:', accessToken);
            window.Kakao.API.request({
                url: '/v2/api/talk/memo/send',
                data: {
                    template_id: 108613,
                    template_args:{'${eventTitle}':`${eventTitle}`}
                },
            })
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.error('메시지 전송 실패', error);
                    alert(`메시지 전송 실패: ${error.response ? error.response.data : error.message}`);
                });
        } else {
            alert('로그인이 필요합니다.');
        }
    };

    //7일 전 일정인지 체크
    function isWithin7Days(eventDate) {
        const today = new Date();
        const eventDateObj = new Date(eventDate);
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);

        return eventDateObj >= today && eventDateObj <= sevenDaysLater;
    }

    const checkTodayEvents = (eventInfo) => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        const eventDate = new Date(eventInfo.event.start);
        sevenDaysAgo.setDate(today.getDate()+7);
        const eventName1 = '생일'; // 찾고자 하는 일정 이름
        const eventName2 = '어린이날';
        const eventName3 = '크리스마스';
        const eventName4 = '설날';
        const eventName5 = '추석';


        if (isWithin7Days(eventDate) && eventInfo.event.title.includes(eventName1)) {
            console.log('오늘의 일정:', eventInfo.event.title);
            handleLoginAndSend(eventInfo.event.title)
        }else if (isWithin7Days(eventDate) && eventInfo.event.title.includes(eventName2)){
            console.log('오늘의 일정:', eventInfo.event.title);
            handleLoginAndSend(eventInfo.event.title)
        }else if (isWithin7Days(eventDate) && eventInfo.event.title.includes(eventName3)){
            console.log('오늘의 일정:', eventInfo.event.title);
            handleLoginAndSend(eventInfo.event.title)
        }else if (isWithin7Days(eventDate)&& eventInfo.event.title.includes(eventName4)){
            console.log('오늘의 일정:', eventInfo.event.title);
            handleLoginAndSend(eventInfo.event.title)
        }else if (isWithin7Days(eventDate)&& eventInfo.event.title.includes(eventName5)){
            console.log('오늘의 일정:', eventInfo.event.title);
            handleLoginAndSend(eventInfo.event.title)
        }
    };

    //중간에 올 내용
    const MiddleHandComponent = () => {
        return (
            <div className="middleFrame" style={{
                width: 927, height: 940, backgroundColor: 'white'
                , marginLeft: 'auto', marginRight: 'auto'
            }}>
                <FullCalendar plugins={[dayGridPlugin, googleCalendarPlugin]}
                              initialView={'dayGridMonth'}
                              locale={'ko'}
                              googleCalendarApiKey={process.env.REACT_APP_GOOGLECALENDAR_API_KEY}
                              eventSources={[
                                  {
                                      googleCalendarId: '0854f205d29ebd36ef99ff75db7aab5b34cf1c3e9b3f909d4fe69035ec9a2cec@group.calendar.google.com',
                                      backgroundColor: '#ceadee',
                                      display: 'block',
                                      borderColor: '#CEADEEFF'
                                  },
                                  {
                                      googleCalendarId: 'ko.south_korea#holiday@group.v.calendar.google.com',
                                      backgroundColor: "#F2921D",
                                      borderColor: '#F2921D'
                                  }
                              ]}
                              eventDidMount={checkTodayEvents}
                />
            </div>
        );
    };

    return (
        <div>
            <TopHandComponent />
            <MiddleHandComponent />
        </div>
    );
}

export default App;
