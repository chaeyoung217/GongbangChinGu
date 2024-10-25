import React, {useEffect, useRef, useState} from 'react';
import { debounce } from 'lodash';
import './App.css';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import Long from 'long'
import axios from "axios";

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
                       style={{fontSize: 30, lineHeight: '100%', color: 'rgba(124, 110, 20, 1)'}}>공방친구</p>
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
                         style={{width: 50, height: 50, borderRadius: 8}}
                         src="https://via.placeholder.com/50x50" alt="search"/>
                </div>
                <div className="profile" style={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                }}>
                    <div>
                        <img className="image"
                             style={{width: 70, height: 70, borderRadius: 9999}}
                             src="https://via.placeholder.com/70x70" alt="profile"/>
                    </div>
                    <div>
                        <p className="name"
                           style={{width: 165, height: 50, fontSize: 30, lineHeight: '100%', color: 'black'}}>
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
    const handleLoginAndSend = (eventTitle, products) => {
        console.log('로그인 시도');
        window.Kakao.Auth.login({
            scope: 'talk_message',
            success: (authObj) => {
                console.log('로그인 성공', authObj);
                sendKakaoMessage(eventTitle, products);
            },
            fail: (err) => {
                console.error('로그인 실패', err);
                alert('로그인 실패');
            }
        });
    };

    //카카오톡 메세지 전송
    const sendKakaoMessage = (eventTitle, products) => {
        console.log('메시지 전송 시도');
        const accessToken = window.Kakao.Auth.getAccessToken();
        if (window.Kakao && window.Kakao.isInitialized() && window.Kakao.Auth.getAccessToken()) {
            console.log('액세스 토큰:', accessToken);

            if (products.length === 0) {
                alert('추천 선물이 없습니다.');
                return; // 함수를 종료
            }

            console.log("Product Name:", products.productName);
            console.log("Product Price:", products.productPrice);

            window.Kakao.API.request({
                url: '/v2/api/talk/memo/send',
                data: {
                    template_id: 108613,
                    template_args: {
                        '${eventTitle}': `${eventTitle}`,

                        '${giftName1}': products[0].productName, // 현재 제품 이름
                        '${giftPrice1}': products[0].productPrice+'원',

                        '${giftName2}': (products[1]!=null?products[1].productName:''),
                        '${giftPrice2}': (products[1]!=null?products[1].productPrice+'원':''),

                        '${giftName3}': (products[2]!=null?products[2].productName:''),
                        '${giftPrice3}': (products[2]!=null?products[2].productPrice+'원':'')
                    },
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

    //3일 전 일정인지 체크
    function isWithin3Days(eventDate) {
        const today = new Date();
        const eventDateObj = new Date(eventDate);
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        return eventDateObj >= today && eventDateObj <= threeDaysLater;
    }

    //물품 기반 추천
    let userNo = Long.fromValue(4);

    //이벤트 모음
    const events = [
        '생일',
        '어린이날',
        '설날',
        '추석',
    ]

    const [hasRun, setHasRun] = useState(false);

    const [products, setProducts] = useState([]);

    const checkTodayEvents = async (eventInfo) => {
        const eventDate = new Date(eventInfo.event.start);

        if (hasRun || !isWithin3Days(eventDate)) {
            return;
        }

       setHasRun(true);

        //데이터 불러오기
        try {
            // 상품 번호 가져오기
            const response = await axios.get(`/api/productNo?userNo=${userNo}`);

            // 상품 번호가 유효한지 확인
            if (response.data && response.data.length > 0) {
                const productNos = response.data.join(',');

                // 상품 정보 가져오기
                const productResponse = await axios.get(`/api/product?productNos=${productNos}`);
                const productData = productResponse.data;
                console.log('Product response data:', productData);

                // 상태 업데이트
                setProducts(productData);


                // 이벤트 선정 및 메세지 전송
                for (let i = 0; i < events.length; i++) {
                    if (eventInfo.event.title.includes(events[i])) {
                        console.log('3일 후 일정:', eventInfo.event.title);

                        const shortEvent = events[i];

                        const requestData = {
                            products: productData,  // productData가 올바른 배열 형식인지 확인
                            event: shortEvent // 직접 할당
                        };


                        const recommendGiftResponse = await axios.post(`/api/gift`, requestData);

                        const recommendGifts =recommendGiftResponse.data;

                        // 메세지 전송 함수 호출
                        handleLoginAndSend(eventInfo.event.title, recommendGifts);
                        console.log('Recommended Gifts:', recommendGifts);
                    }
                }
            } else {
                console.warn('상품 번호가 없습니다.');
            }
        } catch (error) {
            console.error('Error:', error);
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
                                      googleCalendarId: 'ss4310778@gmail.com',
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
            <TopHandComponent/>
            <MiddleHandComponent/>
        </div>
    );
}
export default App;
