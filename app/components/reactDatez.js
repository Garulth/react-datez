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
                            { this.props.yearButton ? this.props.yearButton :
                            <button className="rdatez-btn rdatez-btn-year-mobile" onClick={this.changeCalendar}>
                               {
                                   this.state.yearJumpOpen ? 'D' : 'Y'
                                }
                           </button>}
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
