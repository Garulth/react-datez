import React, { Component, PropTypes } from 'react'
import moment from 'moment'
import classnames from 'classnames'

class ReactDatez extends Component {
    constructor(props) {
        super(props)

        this.state = {
            datePickerOpen: false,
            monthSelectOpen: false,
            yearJumpOpen: false,
            decadeJumpOpen: false,
            datePickerInputHeight: null,
            weekStartsOn: null,
            currentMonthYear: null,
            selectedDate: moment().startOf('day'),
            visibleYear: moment(),
            disabledToday: false,
            type: 'day'
        }

        this.initialisePicker = this.initialisePicker.bind(this)
        this.handleClickEvent = this.handleClickEvent.bind(this)
        this.initialiseCalendar = this.initialiseCalendar.bind(this)
        this.initialiseMonthCalendar = this.initialiseMonthCalendar.bind(this)
        this.initialiseYearCalendar = this.initialiseYearCalendar.bind(this)
        this.renderCalendar = this.renderCalendar.bind(this)
        this.selectedDate = this.selectedDate.bind(this)
        this.isPast = this.isPast.bind(this)
        this.isFuture = this.isFuture.bind(this)
        this.isBeforeStartDate = this.isBeforeStartDate.bind(this)
        this.isAfterEndDate = this.isAfterEndDate.bind(this)
        this.openPicker = this.openPicker.bind(this)
        this.closePicker = this.closePicker.bind(this)
        this.toggleYearJump = this.toggleYearJump.bind(this)
        this.toggleDecadeJump = this.toggleDecadeJump.bind(this)
        this.jumpToToday = this.jumpToToday.bind(this)
        this.nextButton = this.nextButton.bind(this)
        this.prevButton = this.prevButton.bind(this)
        this.clickDay = this.clickDay.bind(this)
        this.clickMonth = this.clickMonth.bind(this)
        this.clickYear = this.clickYear.bind(this)
        this.clickDecade = this.clickDecade.bind(this)
        this.disabledTodayJump = this.disabledTodayJump.bind(this)
        this.changeCalendar = this.changeCalendar.bind(this)
    }

    componentWillMount() {
        if (this.props.locale !== 'en') moment.locale(this.props.locale)
    }

    componentDidMount() {
        this.initialisePicker()

        document.addEventListener('mousedown', this.handleClickEvent)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.defaultMonth !== this.props.defaultMonth) {
            const currentMonthYear = this.getCurrentMonthYear(nextProps)
            this.setState({
                currentMonthYear,
                weekStartsOn: moment(`1 ${currentMonthYear}`, 'D M YYYY').day()
            })
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleClickEvent)
    }

    getCurrentMonthYear(props) {
        let currentMonthYear = moment()
        if ((props.input && props.input.value) && moment(props.input.value, props.dateFormat).isValid()) {
            currentMonthYear = moment(props.input.value, props.dateFormat)
        } else if (props.defaultMonth) {
            currentMonthYear = moment(props.defaultMonth)
        }

        return currentMonthYear.format('M YYYY')
    }

    initialisePicker() {
        const input = this.props.input || {}

        const currentMonthYear = this.getCurrentMonthYear(this.props)

        this.setState({
            selectedDate: (input.value && moment(input.value, this.props.dateFormat).isValid()) ? moment(input.value, this.props.dateFormat) : '',
            datePickerInputHeight: `${this.dateInput.clientHeight}px`,
            weekStartsOn: moment(`1 ${currentMonthYear}`, 'D M YYYY').day(),
            currentMonthYear
        })
    }

    handleClickEvent(event) {
        if (this.rdatez && !this.rdatez.contains(event.target) && this.state.datePickerOpen) {
            this.closePicker()
        }
    }

    initialiseMonthCalendar() {
        const months = []

        for (let i = 1; i < 13; i += 1) {
            months.push(<a href="" className="rdatez-month" key={`${this.state.currentMonthYear}-months-${i}`} onClick={e => this.clickMonth(e, i)}>{moment(i, 'M').format('MMM')}</a>)
        }

        return months
    }

    initialiseYearCalendar() {
        const years = []

        const visibleYear = this.state.visibleYear.format('YYYY')
        const renderYear = (parseInt(visibleYear) + (10 - (this.state.visibleYear.format('YY') % 10)) - 9)
        // change render year from here
        for (let i = 0; i <= 9; i += 1) {
            years.push(<a href="" className="rdatez-year" key={`years-${i}`} onClick={e => this.clickYear(e, renderYear + i)}>{renderYear + i}</a>)
        }
        return years
    }

    initialiseDecadeCalendar() {
        const decades = []
        const visibleYear = this.state.visibleYear.format('YYYY')
        const renderYear = (parseInt(visibleYear) + (10 - (this.state.visibleYear.format('YY') % 10)) - 80)
        // const numbers =
        // change render year from here
        for (let i = 0; i < 8; i += 1) {
            decades.push(<a href="" className="rdatez-year" key={`years-${i}`} onClick={e => this.clickDecade(e, renderYear + i * 10)}>
                {renderYear + (i * 10) + 1} - {renderYear + (i + 1) * 10}
            </a>)
        }
        return decades
    }

    initialiseCalendar() {
        const calendar = []
        for (let i = 0; i < this.props.displayCalendars; i += 1) {
            calendar.push(i)

            if (i === 1) {
                break
            }
        }

        // Days of the week, start on Monday
        const days = moment.weekdaysMin()
        days.push(days.shift())
        let calendarTitle = moment(this.state.currentMonthYear, 'M YYYY').format('MMMM YYYY')
        if (this.state.yearJumpOpen) {
            calendarTitle = this.props.locale != 'en' ? 'Năm' : 'Years'
        }

        if (this.state.decadeJumpOpen) {
            calendarTitle = this.props.locale != 'en' ? 'Thập kỷ' : 'Decades'
        }


        return calendar.length == 1 ?
            <div>
                <header className="rdatez-calendar-title">
                    <span onClick={this.changeCalendar}>
                        {calendarTitle}
                    </span>
                </header>
                <section className="rdatez-daysofweek">
                    {days.map((d, index) => <span key={index}>{d}</span>)}
                </section>
                {this.renderCalendar(0)}
            </div>
        : calendar.map(i => (
            <div key={`calendar-${i}`}>
                <header className="rdatez-calendar-title" key={`month-header-${i}`}>{moment(this.state.currentMonthYear, 'M YYYY').add(i, 'months').format('MMMM YYYY')}</header>
                <section className="rdatez-daysofweek">
                    {days.map((d, index) => <span key={index}>{d}</span>)}
                </section>
                {this.renderCalendar(i)}
            </div>
        ))
    }

    changeCalendar() {
        if (this.state.yearJumpOpen || this.state.decadeJumpOpen) {
            return this.toggleDecadeJump()
        }

        return this.toggleYearJump()
    }

    selectedDate(date) {
        if (moment(this.state.selectedDate, this.props.dateFormat).diff(moment(date, this.props.dateFormat), 'days') === 0) {
            return true
        }

        return false
    }

    isPast(date) {
        if (moment().startOf('day').diff(moment(date, this.props.dateFormat), 'days') > 0) {
            return true
        }

        return false
    }

    isFuture(date) {
        if (moment().startOf('day').diff(moment(date, this.props.dateFormat), 'days') < 0) {
            return true
        }

        return false
    }

    isBeforeStartDate(date) {
        if (moment(this.props.endDate).diff(moment(date, this.props.dateFormat)) < 0) {
            return true
        }

        return false
    }

    isAfterEndDate(date) {
        if (moment(this.props.startDate).diff(moment(date, this.props.dateFormat)) > 0) {
            return true
        }

        return false
    }

    openPicker() {
        document.body.classList.add('date-open')

        this.setState({
            datePickerOpen: true
        })

        // Disabled todayJump
        this.disabledTodayJump()
    }

    closePicker() {
        document.body.classList.remove('date-open')

        this.setState({
            datePickerOpen: false
        })
    }

    disabledTodayJump() {
        // If today is outside of the start and endDate range disable the today jump.
        if ((this.props.startDate && this.isBeforeStartDate(moment())) || (this.props.endDate && this.isAfterEndDate(moment()))) {
            this.setState({
                disabledToday: true
            })
        }
    }

    toggleYearJump() {
        if (!this.state.monthSelectOpen) {
            this.setState({
                yearJumpOpen: !this.state.yearJumpOpen,
            })
        }
    }

    toggleDecadeJump() {
        if (!this.state.decadeJumpOpen) {
            this.setState({
                decadeJumpOpen: true,
                yearJumpOpen: false,
                monthSelectOpen: false,
            })
        } else {
            this.setState({
                decadeJumpOpen: false
            })
        }
    }

    jumpToToday(e) {
        e.preventDefault()

        const date = (!this.props.allowFuture) ? moment().format(this.props.dateFormat) : moment().format(this.props.dateFormat)

        // catch the date range
        if ((this.props.startDate && this.isBeforeStartDate(date)) || (this.props.endDate && this.isAfterEndDate(date))) {
            return false
        }

        this.setState({
            currentMonthYear: moment().format('M YYYY'),
            selectedDate: date,
            yearJumpOpen: false,
            monthSelectOpen: false
        })

        if (this.props.input) {
            this.props.input.onChange(moment(date, this.props.dateFormat))
        }

        return true
    }

    nextButton() {
        if (this.state.decadeJumpOpen) {
            this.setState({
                visibleYear: this.state.visibleYear.add(80, 'years')
            })
            this.initialiseDecadeCalendar()
        } else
        if (this.state.yearJumpOpen) {
            this.setState({
                visibleYear: this.state.visibleYear.add(12, 'years')
            })
            this.initialiseYearCalendar()
        } else {
            this.setState({
                currentMonthYear: moment(this.state.currentMonthYear, 'M YYYY').add(1, 'months').format('M YYYY'),
                weekStartsOn: moment(`1 ${this.state.currentMonthYear}`, 'D M YYYY').add(1, 'months').day()
            })
        }
    }

    prevButton() {
        if (this.state.decadeJumpOpen) {
            this.setState({
                visibleYear: this.state.visibleYear.subtract(80, 'years')
            })
            this.initialiseDecadeCalendar()
        } else
        if (this.state.yearJumpOpen) {
            this.setState({
                visibleYear: this.state.visibleYear.subtract(12, 'years')
            })
            this.initialiseYearCalendar()
        } else {
            this.setState({
                currentMonthYear: moment(this.state.currentMonthYear, 'M YYYY').subtract(1, 'months').format('M YYYY'),
                weekStartsOn: moment(`1 ${this.state.currentMonthYear}`, 'D M YYYY').subtract(1, 'months').day()
            })
        }
    }

    clickDay(e, date) {
        e.preventDefault()

        if (this.isPast(date) && !this.props.allowPast) {
            return false
        }

        if (this.isFuture(date) && !this.props.allowFuture) {
            return false
        }

        if (this.isBeforeStartDate(date) && this.props.startDate) {
            return false
        }

        if (this.isAfterEndDate(date) && this.props.endDate) {
            return false
        }

        this.setState({
            selectedDate: date
        })

        if (this.props.input) {
            this.props.input.onChange(moment(date, this.props.dateFormat).format())
        } else {
            this.props.handleChange(moment(date, this.props.dateFormat).format())
        }

        return this.closePicker()
    }

    clickMonth(e, month) {
        e.preventDefault()

        this.setState({
            currentMonthYear: moment(this.state.currentMonthYear, 'M YYYY').format(`${month} YYYY`),
            weekStartsOn: moment(`1 ${this.state.currentMonthYear}`, 'D M YYYY').set('month', month - 1).day(),
            monthSelectOpen: false
        })
    }

    clickYear(e, year) {
        e.preventDefault()

        this.setState({
            currentMonthYear: moment(this.state.currentMonthYear, 'M YYYY').format(`M ${year}`),
            weekStartsOn: moment(`1 ${this.state.currentMonthYear}`, 'D M YYYY').set('year', year).day(),
            monthSelectOpen: true
        })

        this.toggleYearJump()
    }

    clickDecade(e, year) {
        e.preventDefault()
        this.setState({
            visibleYear: moment().set('year', year),
            yearJumpOpen: true
        })

        this.toggleDecadeJump()
    }

    renderCalendar(offset) {
        const date = (offset) ? moment(this.state.currentMonthYear, 'M YYYY').add(offset, 'months') : moment(this.state.currentMonthYear, 'M YYYY')
        const daysInMonth = date.daysInMonth()
        const startsOn = date.day()
        const calendar = []

        for (let i = 1; i <= daysInMonth; i += 1) {
            const day = date.date(i)
            const dayDate = day.format(this.props.dateFormat)
            if (i === 1) {
                calendar.push(<div className={`rdatez-day-spacer weekday-${day.day()}`} key={`${day.format('MY')}-spacer`} />)
            }

            const dayClasses = classnames(`rdatez-day weekday-${day.day()} ${day.format('M-YYYY')}-${i}`, {
                'selected-day': this.selectedDate(day.format(this.props.dateFormat)),
                'past-day': this.isPast(day.format(this.props.dateFormat)),
                'before-start': this.isBeforeStartDate(day.format(this.props.dateFormat)),
                'after-end': this.isAfterEndDate(day.format(this.props.dateFormat)),
                today: moment().startOf('day').diff(day, 'days') === 0
            })

            calendar.push(<a href="" className={dayClasses} key={`${day.format('DMY')}-${i}`} onClick={e => this.clickDay(e, dayDate)} tabIndex="-1">{i}</a>)
        }

        return <section className={`rdatez-month-days starts-on-${startsOn}`}>{calendar}</section>
    }

    render() {
        const input = this.props.input || {}

        const rdatezClass = classnames('rdatez', this.props.className, {
            'rdatez-centered': this.props.position === 'center',
            'rdatez-right': this.props.position === 'right'
        })

        const rdatezInputClass = classnames(this.props.inputClassName)

        const rdatezStyle = this.props.style
        const rdatezInputStyle = this.props.inputStyle

        const pickerClass = classnames('rdatez-picker', {
            'multi-cal': (this.props.displayCalendars > 1),
            'no-cal': (this.props.displayCalendars === 0),
            'highlight-weekends': this.props.highlightWeekends,
            'disallow-past': !this.props.allowPast,
            'disallow-future': !this.props.allowFuture,
            'disallow-before-start': this.props.startDate,
            'disallow-after-end': this.props.endDate
        })

        return (
            <div className={rdatezClass} style={rdatezStyle} ref={(element) => { this.rdatez = element }} >
                {!this.props.isRedux ?
                    <input
                        style={rdatezInputStyle}
                        className={rdatezInputClass}
                        onClick={this.openPicker}
                        placeholder={this.props.placeholder}
                        onFocus={this.openPicker}
                        readOnly
                        value={this.props.value && moment(this.props.value, 'YYYY-MM-DD').format(this.props.dateFormat)}
                        ref={(element) => {
                            this.dateInput = element
                        }}
                    /> :
                    <input
                        style={rdatezInputStyle}
                        className={rdatezInputClass}
                        onClick={this.openPicker}
                        placeholder={this.props.placeholder}
                        onFocus={this.openPicker}
                        readOnly
                        value={input.value && moment(input.value, 'YYYY-MM-DD').format(this.props.dateFormat)}
                        ref={(element) => {
                            this.dateInput = element
                        }}
                    />}
                {!this.props.disableInputIcon ?
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" onClick={this.openPicker} className="cal-icon">
                        <g id="budicon-calendar">
                            <path d="M24,2H19V.5a.5.5,0,0,0-1,0V2H7V.5a.5.5,0,0,0-1,0V2H1A1,1,0,0,0,0,3V23a1,1,0,0,0,1,1H24a1,1,0,0,0,1-1V3A1,1,0,0,0,24,2Zm0,21H1V8H24ZM24,7H1V3H24Z" />
                        </g>
                    </svg> : null
                }
                {this.state.datePickerOpen && <div className={pickerClass} style={{ top: this.state.datePickerInputHeight }}>
                    <div>
                        <header className="rdatez-header">
                            <button className="rdatez-mobile-close" onClick={this.closePicker}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
                                    <path d="M16.8535,8.1465a.5.5,0,0,0-.707,0L12.5,11.793,8.8535,8.1465a.5.5,0,0,0-.707.707L11.793,12.5,8.1465,16.1465a.5.5,0,1,0,.707.707L12.5,13.207l3.6465,3.6465a.5.5,0,0,0,.707-.707L13.207,12.5l3.6465-3.6465A.5.5,0,0,0,16.8535,8.1465Z" />
                                    <path d="M12.5,0A12.5,12.5,0,1,0,25,12.5,12.5,12.5,0,0,0,12.5,0Zm0,24A11.5,11.5,0,1,1,24,12.5,11.5129,11.5129,0,0,1,12.5,24Z" />
                                </svg>
                            </button>
                            <button type="button" className="rdatez-btn rdatez-btn-prev" onClick={this.prevButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
                                    <path d="M14.5,23a.4984.4984,0,0,1-.3535-.1465l-9-9a.5.5,0,0,1,0-.707l9-9a.5.5,0,1,1,.707.707L6.207,13.5l8.6465,8.6465A.5.5,0,0,1,14.5,23Z" />
                                </svg>
                            </button>
                            <button type="button" className="rdatez-btn rdatez-btn-next" onClick={this.nextButton}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
                                    <path d="M9.5,23a.4984.4984,0,0,0,.3535-.1465l9-9a.5.5,0,0,0,0-.707l-9-9a.5.5,0,0,0-.707.707L17.793,13.5,9.1465,22.1465A.5.5,0,0,0,9.5,23Z" />
                                </svg>
                            </button>
                            <button className="rdatez-btn rdatez-btn-year-mobile" onClick={this.changeCalendar}>
                                {
                                    this.props.yearButton ? this.props.yearButton : (this.state.yearJumpOpen ? 'D' : 'Y')
                                }
                            </button>
                            {/* {<button type="button" className="rdatez-btn rdatez-btn-year" onClick={this.toggleDecadeJump}>
                                {this.props.decadeButton ? this.props.decadeButton : 'Decade' }
                            </button>} */}
                            {/* {this.props.yearJump && <button type="button" className="rdatez-btn rdatez-btn-year" onClick={this.toggleYearJump}>
                                {this.props.yearButton ? this.props.yearButton :
                                'Year'
                            }
                        </button>} */}
                            {/* //      <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                        //      viewBox="0 0 59 59">
                        //     <path d="M31.793,41.707C31.988,41.902,32.244,42,32.5,42s0.512-0.098,0.707-0.293l3.293-3.293l3.293,3.293
                        //         C39.988,41.902,40.244,42,40.5,42s0.512-0.098,0.707-0.293c0.391-0.391,0.391-1.023,0-1.414L37.914,37l3.293-3.293
                        //         c0.391-0.391,0.391-1.023,0-1.414s-1.023-0.391-1.414,0L36.5,35.586l-3.293-3.293c-0.391-0.391-1.023-0.391-1.414,0
                        //         s-0.391,1.023,0,1.414L35.086,37l-3.293,3.293C31.402,40.684,31.402,41.316,31.793,41.707z"/>
                        //     <path d="M26.5,0c-0.553,0-1,0.447-1,1s0.447,1,1,1c1.302,0,2.402,0.838,2.816,2h2.083C30.934,1.721,28.914,0,26.5,0z"/>
                        //     <path d="M32.5,0c-0.553,0-1,0.447-1,1s0.447,1,1,1c1.302,0,2.402,0.838,2.816,2h2.083C36.934,1.721,34.914,0,32.5,0z"/>
                        //     <path d="M38.5,0c-0.553,0-1,0.447-1,1s0.447,1,1,1c1.302,0,2.402,0.838,2.816,2h2.083C42.934,1.721,40.914,0,38.5,0z"/>
                        //     <path d="M43.399,4C43.465,4.323,43.5,4.658,43.5,5c0,2.757-2.243,5-5,5c-0.553,0-1-0.447-1-1s0.447-1,1-1c1.654,0,3-1.346,3-3
                        //         c0-0.353-0.072-0.686-0.184-1h-3.917C37.465,4.323,37.5,4.658,37.5,5c0,2.757-2.243,5-5,5c-0.553,0-1-0.447-1-1s0.447-1,1-1
                        //         c1.654,0,3-1.346,3-3c0-0.353-0.072-0.686-0.184-1h-3.917C31.465,4.323,31.5,4.658,31.5,5c0,2.757-2.243,5-5,5
                        //         c-0.553,0-1-0.447-1-1s0.447-1,1-1c1.654,0,3-1.346,3-3c0-0.353-0.072-0.686-0.184-1h-3.917C25.465,4.323,25.5,4.658,25.5,5
                        //         c0,2.757-2.243,5-5,5c-0.553,0-1-0.447-1-1s0.447-1,1-1c1.654,0,3-1.346,3-3c0-0.353-0.072-0.686-0.184-1H18.5h-0.816
                        //         c0.414-1.162,1.514-2,2.816-2s2.402,0.838,2.816,2h2.083c-0.465-2.279-2.484-4-4.899-4s-4.434,1.721-4.899,4H14.5h-14v11v14v2v12v2
                        //         v14h14h2h12h2h12h2h14V45v-2V31v-2V15V4H43.399z M14.5,57h-12V45h12V57z M14.5,43h-12V31h12V43z M14.5,29h-12V17h12V29z M28.5,57
                        //         h-12V45h12V57z M28.5,43h-12V31h12V43z M28.5,29h-12V17h12V29z M42.5,57h-12V45h12V57z M42.5,43h-12V31h12V43z M42.5,29h-12V17h12
                        //         V29z M56.5,57h-12V45h12V57z M56.5,43h-12V31h12V43z M56.5,29h-12V17h12V29z"/>

                        // </svg>
                                // <svg height="512pt" viewBox="0 -6 512 511" width="512pt" xmlns="http://www.w3.org/2000/svg">
                                // <path d="m425.8125 266c4.199219 0 7.601562-3.40625 7.601562-7.605469v-21.289062c0-4.199219-3.402343-7.605469-7.601562-7.605469-4.203125 0-7.605469 3.40625-7.605469 7.605469v21.289062c0 4.203125 3.402344 7.605469 7.605469 7.605469zm0 0"/>
                                // <path d="m418.207031 312.367188c0 4.199218 3.402344 7.605468 7.605469 7.605468 4.199219 0 7.601562-3.40625 7.601562-7.605468v-21.289063c0-4.199219-3.402343-7.605469-7.601562-7.605469-4.203125 0-7.605469 3.40625-7.605469 7.605469zm0 0"/>
                                // <path d="m463.441406 282.339844c4.199219 0 7.605469-3.402344 7.605469-7.601563s-3.40625-7.605469-7.605469-7.605469h-21.289062c-4.199219 0-7.605469 3.40625-7.605469 7.605469s3.40625 7.601563 7.605469 7.601563zm0 0"/>
                                // <path d="m409.46875 282.339844c4.199219 0 7.605469-3.402344 7.605469-7.601563s-3.40625-7.605469-7.605469-7.605469h-21.289062c-4.199219 0-7.605469 3.40625-7.605469 7.605469s3.40625 7.601563 7.605469 7.601563zm0 0"/>
                                // <path d="m74.019531 314.863281c0-4.199219-3.402343-7.601562-7.601562-7.601562-4.203125 0-7.605469 3.402343-7.605469 7.601562v21.292969c0 4.199219 3.402344 7.605469 7.605469 7.605469 4.199219 0 7.601562-3.40625 7.601562-7.605469zm0 0"/>
                                // <path d="m66.417969 361.234375c-4.203125 0-7.605469 3.402344-7.605469 7.601563v21.292968c0 4.199219 3.402344 7.605469 7.605469 7.605469 4.199219 0 7.601562-3.40625 7.601562-7.605469v-21.292968c0-4.199219-3.402343-7.601563-7.601562-7.601563zm0 0"/>
                                // <path d="m111.652344 352.496094c0-4.199219-3.40625-7.605469-7.605469-7.605469h-21.289063c-4.199218 0-7.605468 3.40625-7.605468 7.605469 0 4.199218 3.40625 7.605468 7.605468 7.605468h21.289063c4.199219 0 7.605469-3.40625 7.605469-7.605468zm0 0"/>
                                // <path d="m28.785156 344.890625c-4.199218 0-7.605468 3.40625-7.605468 7.605469 0 4.199218 3.40625 7.605468 7.605468 7.605468h21.289063c4.199219 0 7.605469-3.40625 7.605469-7.605468 0-4.199219-3.40625-7.605469-7.605469-7.605469zm0 0"/>
                                // <path d="m433.40625 65.789062h-13.171875v-27.269531c0-20.964843-17.054687-38.019531-38.019531-38.019531-20.960938 0-38.019532 17.054688-38.019532 38.019531v27.269531h-176.398437v-27.269531c0-20.964843-17.058594-38.019531-38.019531-38.019531-20.964844 0-38.019532 17.054688-38.019532 38.019531v27.269531h-13.164062c-43.335938 0-78.59375 35.257813-78.59375 78.59375v276.214844c0 43.339844 35.257812 78.59375 78.59375 78.59375h253.558594c4.199218 0 7.601562-3.402344 7.601562-7.601562 0-4.199219-3.402344-7.605469-7.601562-7.605469h-253.558594c-34.949219 0-63.386719-28.433594-63.386719-63.386719v-211.710937c8.449219 7.824219 19.742188 12.617187 32.136719 12.617187h27.808594c4.199218 0 7.601562-3.402344 7.601562-7.601562 0-4.199219-3.402344-7.605469-7.601562-7.605469h-27.808594c-17.71875 0-32.136719-14.414063-32.136719-32.136719v-29.777344c0-34.953124 28.4375-63.386718 63.386719-63.386718h13.164062v59.410156c0 20.964844 17.058594 38.019531 38.019532 38.019531 20.964844 0 38.019531-17.054687 38.019531-38.019531v-59.410156h176.402344v59.410156c0 20.964844 17.054687 38.019531 38.019531 38.019531 20.960938 0 38.019531-17.054687 38.019531-38.019531v-59.410156h13.167969c34.953125 0 63.386719 28.433594 63.386719 63.386718v29.78125c0 17.71875-14.414063 32.132813-32.132813 32.132813h-359.09375c-4.199218 0-7.601562 3.40625-7.601562 7.605469 0 4.199218 3.402344 7.605468 7.601562 7.605468h359.089844c12.394531 0 23.6875-4.796874 32.136719-12.621093v211.710937c0 34.953125-28.4375 63.386719-63.386719 63.386719h-70.839844c-4.199218 0-7.601562 3.40625-7.601562 7.605469 0 4.199218 3.402344 7.605468 7.601562 7.605468h70.839844c43.335938 0 78.59375-35.257812 78.59375-78.597656v-276.214844c0-43.335937-35.257812-78.59375-78.59375-78.59375zm-303.628906 97.425782c-12.578125 0-22.8125-10.230469-22.8125-22.808594v-101.886719c0-12.578125 10.234375-22.8125 22.8125-22.8125s22.8125 10.234375 22.8125 22.8125v101.886719c0 12.578125-10.234375 22.808594-22.8125 22.808594zm275.25-22.808594c0 12.578125-10.234375 22.8125-22.8125 22.8125s-22.808594-10.234375-22.808594-22.8125v-101.886719c0-12.578125 10.230469-22.8125 22.808594-22.8125s22.8125 10.234375 22.8125 22.8125zm0 0"/>
                                // <path d="m114.800781 414.34375h58.484375c3.589844 0 6.863282-4.605469 6.863282-9.65625 0-4.96875-3.207032-9.328125-6.863282-9.328125h-45.542968v-3.816406c0-6.929688 8.804687-13.039063 19-20.113281 14.738281-10.21875 33.074218-22.9375 33.074218-43.953126 0-9.878906-3.90625-18.382812-11.296875-24.597656-6.816406-5.726562-15.917969-8.878906-25.625-8.878906-9.277343 0-18.003906 2.882812-24.578125 8.117188-7.113281 5.664062-10.871094 13.351562-10.871094 22.238281 0 7.820312 3.210938 11.625 9.820313 11.625 7.339844 0 11.296875-4.128907 11.296875-8.011719 0-4.777344 1.429688-8.460938 4.25-10.953125 2.5-2.210937 6.042969-3.378906 10.246094-3.378906 7.296875 0 15.148437 4.535156 15.148437 14.496093 0 11.148438-12.210937 20.070313-25.144531 29.515626-13.644531 9.964843-27.75 20.273437-27.75 33.894531v15.933593c0 4.191407 5.621094 6.867188 9.488281 6.867188zm0 0"/>
                                // <path d="m230.289062 294c-11.652343 0-20.882812 2.878906-27.433593 8.550781-7.386719 6.398438-11.132813 16.222657-11.132813 29.195313v45.835937c0 12.972657 3.746094 22.792969 11.132813 29.191407 6.550781 5.675781 15.78125 8.554687 27.433593 8.554687 11.667969 0 20.925782-2.878906 27.519532-8.554687 7.441406-6.40625 11.214844-16.226563 11.214844-29.191407v-45.835937c0-12.964844-3.773438-22.785156-11.214844-29.195313-6.59375-5.671875-15.851563-8.550781-27.519532-8.550781zm-16.957031 37.746094c0-12.449219 5.703125-18.765625 16.957031-18.765625 11.203126 0 17.125 6.488281 17.125 18.765625v45.835937c0 12.273438-5.921874 18.765625-17.125 18.765625-11.25 0-16.957031-6.316406-16.957031-18.765625zm0 0"/>
                                // <path d="m296.289062 412.621094c1.957032 1.109375 4.597657 1.71875 7.433594 1.71875 5.371094 0 10.804688-2.355469 10.804688-6.859375v-106.78125c0-4.203125-4.992188-7.027344-9.652344-7.027344-1.703125 0-3.226562.5625-4.515625 1.667969l-19.375 14.777344c-2.53125 1.582031-4.164063 4.65625-4.164063 7.828124 0 2.15625.703126 4.324219 1.933594 5.949219 1.328125 1.757813 3.136719 2.722657 5.089844 2.722657 1.050781 0 2.601562-.261719 4.035156-1.515626l5.039063-5.042968v87.421875c0 2.113281 1.164062 3.890625 3.371093 5.140625zm0 0"/>
                                // <path d="m367.464844 396.347656c-9.886719 0-16.792969-4.949218-16.792969-12.03125 0-5.425781-3.800781-8.175781-11.300781-8.175781-7.207032 0-10.148438 2.605469-10.148438 8.996094 0 7.488281 3.273438 14.886719 8.972656 20.300781 6.816407 6.46875 16.710938 9.890625 28.613282 9.890625 12.015625 0 21.550781-2.878906 28.335937-8.550781 7.660157-6.40625 11.542969-16.230469 11.542969-29.195313v-45.835937c0-12.957032-3.800781-22.777344-11.296875-29.195313-6.628906-5.671875-15.914063-8.550781-27.597656-8.550781-11.59375 0-20.800781 2.878906-27.375 8.550781-7.425781 6.417969-11.195313 16.238281-11.195313 29.195313v2.300781c0 12.113281 3.394532 21.140625 10.085938 26.832031 5.695312 4.84375 13.785156 7.300782 24.046875 7.300782 9.820312 0 16.929687-2.671876 21.722656-8.164063v17.5625c0 12.277344-6.089844 18.769531-17.613281 18.769531zm-16.628906-65.914062c0-12.277344 5.863281-18.765625 16.957031-18.765625 11.308593 0 17.289062 6.488281 17.289062 18.765625v3.613281c0 5.941406-1.5625 10.386719-4.644531 13.214844-2.824219 2.59375-7.023438 3.910156-12.480469 3.910156-11.679687 0-17.121093-5.914063-17.121093-18.601563zm0 0"/>
                                // </svg>
                                    // <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
                                    //     <path d="M12.8535,6.8535a.5.5,0,0,0,0-.707l-6-6a.5.5,0,0,0-.707,0l-6,6a.5.5,0,0,0,.707.707L6,1.707V20.5a.5.5,0,0,0,1,0V1.707l5.1465,5.1465A.5.5,0,0,0,12.8535,6.8535Z" />
                                    //     <path d="M24.8535,18.1465a.5.5,0,0,0-.707,0L19,23.293V4.5a.5.5,0,0,0-1,0V23.293l-5.1465-5.1465a.5.5,0,0,0-.707.707l6,6a.5.5,0,0,0,.707,0l6-6A.5.5,0,0,0,24.8535,18.1465Z" />
                                    // </svg> */}
                            {!this.state.disabledToday && <button type="button" className="rdatez-btn rdatez-btn-today" onClick={e => this.jumpToToday(e)}>
                                <svg
version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                viewBox="0 0 433.633 433.633"
                                >
                                    <path
d="M388.749,47.038c-0.886-0.036-1.773-0.042-2.66-0.017h-33.437V18.286C352.653,6.792,341.681,0,330.187,0h-30.824
                                            c-11.494,0-19.853,6.792-19.853,18.286V47.02H154.122V18.286C154.122,6.792,145.763,0,134.269,0h-30.825
                                            C91.951,0,80.979,6.792,80.979,18.286V47.02H47.543C26.199,46.425,8.414,63.246,7.819,84.589
                                            c-0.025,0.886-0.019,1.774,0.017,2.66v301.975c0,22.988,16.718,44.408,39.706,44.408H386.09c22.988,0,39.706-21.42,39.706-44.408
                                            V87.249C426.67,65.915,410.083,47.912,388.749,47.038z M299.363,20.898h32.392v57.469h-32.392V20.898z M103.445,20.898h29.78
                                            v57.469h-29.78V20.898z M404.898,389.224c0,11.494-7.314,23.51-18.808,23.51H47.543c-11.494,0-18.808-12.016-18.808-23.51
                                            V167.184h376.163V389.224z M404.898,87.249v59.037H28.734V87.249c-0.885-9.77,6.318-18.408,16.088-19.293
                                            c0.904-0.082,1.814-0.094,2.72-0.037h33.437v11.494c0,11.494,10.971,19.853,22.465,19.853h30.825
                                            c10.672,0.293,19.56-8.122,19.853-18.794c0.01-0.353,0.01-0.706,0-1.059V67.918H279.51v11.494
                                            c-0.293,10.672,8.122,19.56,18.794,19.853c0.353,0.01,0.706,0.01,1.059,0h30.825c11.494,0,22.465-8.359,22.465-19.853V67.918
                                            h33.437c9.791-0.617,18.228,6.82,18.845,16.611C404.992,85.435,404.98,86.345,404.898,87.249z"
                                    />
                                    <path
d="M158.824,309.812l-9.404,52.245c-0.372,2.241-0.004,4.543,1.049,6.556c2.675,5.113,8.989,7.09,14.102,4.415l47.02-24.555
                                            l47.02,24.555l4.702,1.045c2.267,0.04,4.48-0.698,6.269-2.09c3.123-2.281,4.73-6.099,4.18-9.927l-9.404-52.245l38.139-36.571
                                            c2.729-2.949,3.719-7.109,2.612-10.971c-1.407-3.57-4.577-6.145-8.359-6.792l-52.245-7.837l-23.51-47.543
                                            c-1.025-2.116-2.733-3.825-4.849-4.849c-5.194-2.515-11.443-0.344-13.959,4.849l-23.51,47.543l-52.245,7.837
                                            c-3.782,0.646-6.952,3.222-8.359,6.792c-1.107,3.862-0.116,8.022,2.612,10.971L158.824,309.812z M187.559,267.494
                                            c3.281-0.491,6.061-2.675,7.314-5.747l16.718-33.437l16.718,33.437c1.254,3.072,4.033,5.256,7.314,5.747l37.094,5.224
                                            l-26.645,25.6c-2.482,2.457-3.646,5.949-3.135,9.404l6.269,37.094l-32.914-17.763l-4.702-1.045l-4.702,1.045l-32.914,17.763
                                            l6.269-37.094c0.512-3.455-0.653-6.947-3.135-9.404l-26.645-25.6L187.559,267.494z"
                                    />
                                </svg>
                                {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
                                    <path d="M24,3H19V1.5a.5.5,0,0,0-1,0V3H7V1.5a.5.5,0,0,0-1,0V3H1A1,1,0,0,0,0,4V24a1,1,0,0,0,1,1H24a1,1,0,0,0,1-1V4A1,1,0,0,0,24,3Zm0,21H1V9H24ZM24,8H1V4H24Z" />
                                    <path d="M12.5,22A5.5,5.5,0,1,0,7,16.5,5.5,5.5,0,0,0,12.5,22Zm0-10A4.5,4.5,0,1,1,8,16.5,4.5,4.5,0,0,1,12.5,12Z" />
                                    <path d="M14.2,18.9a.5.5,0,1,0,.6-.8L13,16.75V14.5a.5.5,0,0,0-1,0V17a.5.5,0,0,0,.2.4Z" />
                                </svg> */}
                            </button>}
                        </header>
                        <div className="rdatez-calendar">
                            {this.initialiseCalendar()}
                        </div>
                        {this.state.decadeJumpOpen && <section className="rdatez-calendar-year">
                            {this.initialiseDecadeCalendar()}
                        </section>}
                        {this.state.yearJumpOpen && <section className="rdatez-calendar-year">
                            {this.initialiseYearCalendar()}
                        </section>}
                        {this.state.monthSelectOpen && <section className="rdatez-calendar-month">
                            {this.initialiseMonthCalendar()}
                        </section>}
                    </div>
                </div>}
            </div>
        )
    }
}

ReactDatez.defaultProps = {
    disableInputIcon: false,
    dateFormat: 'DD/MM/YYYY',
    displayCalendars: 1,
    highlightWeekends: false,
    allowPast: false,
    allowFuture: true,
    yearJump: true,
    position: 'left',
    locale: 'en'
}

ReactDatez.propTypes = {
    input: PropTypes.object,
    style: PropTypes.object,
    inputStyle: PropTypes.object,
    className: PropTypes.string,
    inputClassName: PropTypes.string,
    disableInputIcon: PropTypes.bool,
    handleChange: PropTypes.func,
    value: PropTypes.string,
    displayCalendars: PropTypes.number,
    isRedux: PropTypes.bool,
    highlightWeekends: PropTypes.bool,
    allowPast: PropTypes.bool,
    allowFuture: PropTypes.bool,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    position: PropTypes.oneOf(['center', 'left', 'right']),
    dateFormat: PropTypes.string,
    yearJump: PropTypes.bool,
    placeholder: PropTypes.string,
    defaultMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    locale: PropTypes.string,
    yearButton: PropTypes.node
}

export default ReactDatez
