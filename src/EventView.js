// @flow
import { View, Text, ScrollView, StyleSheet } from "react-native";
import populateEvents from "./Packer";
import React from "react";
import moment from "moment";
import _ from "lodash";
import DayView from "./DayView";

const LEFT_MARGIN = 60 - 1;
export const DATE_FORMAT = "YYYY-MM-DD";

function range(from, to) {
	return Array.from(Array(to), (_, i) => from + i);
}

export default class EventView extends React.PureComponent {
	constructor(props) {
		super(props);
		const { initPosition, packedEvents } = this.setupConfigurations(props);
		this.state = {
			_scrollY: initPosition,
			packedEvents
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			packedEvents: this.getEventsByDates(nextProps)
		});
	}

	componentDidUpdate(_, prevState) {
		const { initPosition } = this.setupConfigurations(this.props);
		this.setState(
			{
				_scrollY: initPosition
			},
			() => this.props.scrollToFirst && this.scrollToFirst()
		);
	}

	getSingleViewWidth = ({ mode, width }) => {
		const contentWidth = width - (LEFT_MARGIN * 2)
		return mode === "week" ? contentWidth / 7 : contentWidth;
	};

	isBetween = d => {
		const unit = this.props.mode === "week" ? "week" : "day";
		const start = moment().startOf(unit);
		const end = moment().endOf(unit);
		return moment(d).isBetween(start, end, null, "[]");
	};

	setupConfigurations(props) {
		const { date, start, end, styles } = props;
		this.calendarHeight = (end - start) * 100;
		const packedEvents = this.getEventsByDates(props);
		const timeNowHour = moment().hour();
		const timeNowMin = moment().minutes();
		let initPosition = this.isBetween(date)
			? 100 * (timeNowHour - start) + (100 * timeNowMin) / 60
			: _.min(_.map([].concat.apply([], _.values(packedEvents)), "top")) -
			  this.calendarHeight / (end - start);
		const lastScrollableOffset = this.calendarHeight - this._scrollViewHeight;
		initPosition = initPosition < 0 ? 0 : initPosition;
		initPosition = initPosition > lastScrollableOffset ? lastScrollableOffset : initPosition;
		this.borderStyle = StyleSheet.flatten([
			styles,
			{ dayView: StyleSheet.flatten([styles.dayView, styles.dayViewBorder]) }
		]);
		return { initPosition, packedEvents };
	}

	scrollToFirst() {
		setTimeout(() => {
			if (this.state && this.state._scrollY && this._scrollView) {
				this._scrollView.scrollTo({
					x: 0,
					y: this.state._scrollY,
					animated: true
				});
			}
		}, 1);
	}

	getEventsByDates = (props) => {
		let date = undefined;
		let key = undefined;

		const groupedEvents = props.events.reduce((eventsMap, event) => {
			date = moment(event.start);
			key = date.format(DATE_FORMAT);
			
			const array = eventsMap[key] || [];
			array.push(event);
			eventsMap[key] = array;

			return eventsMap;
		}, {});

		for (key in groupedEvents) {
			if (groupedEvents.hasOwnProperty(key)) {
				groupedEvents[key] = populateEvents(groupedEvents[key], this.getSingleViewWidth(props), props.start);
			}
		}

		return groupedEvents;
	};

	formatTime(i) {
		return `${("0" + i).slice(-2)}:00`;
			}

	_renderLines() {
		const { format24h, start, end } = this.props;
		const offset = this.calendarHeight / (end - start);

		return range(start, end + 1).map((i, index) => {
			let timeText;
			if (i === start) {
				timeText = ``;
			} else if (i < 12) {
				timeText = !format24h ? `${i} AM` : this.formatTime(i);
			} else if (i === 12) {
				timeText = !format24h ? `${i} PM` : this.formatTime(i);
			} else if (i === 24) {
				timeText = !format24h ? `12 AM` : 0;
			} else {
				timeText = !format24h ? `${i - 12} PM` : this.formatTime(i);
			}
			const { width, styles } = this.props;
			return [
				<Text key={`timeLabel${i}`} style={[styles.timeLabel, { top: offset * index - 6 }]}>
					{timeText}
				</Text>,
				i === start ? null : (
					<View key={`line${i}`} style={[styles.line, { top: offset * index, width: width - 98 }]} />
				),
				<View key={`lineHalf${i}`} style={[styles.line, { top: offset * (index + 0.5), width: width - 98 }]} />
			];
		});
	}

	_renderTimeLabels() {
		const { styles, start, end } = this.props;
		const offset = this.calendarHeight / (end - start);
		return range(start, end).map((item, i) => {
			return <View key={`line${i}`} style={[styles.line, { top: offset * i }]} />;
		});
	}

	renderWeekView() {
		const date = moment(this.props.date);
		const startOfWeek = date.clone().startOf("isoWeek");
		const endOfWeek = date.clone().endOf("isoWeek");
		const { styles } = this.props;
		
		let components = [];
		let day = startOfWeek;
		let style = styles;

		while (day <= endOfWeek) {
			components.push(this.renderDayView(day, this.state.packedEvents[day.format(DATE_FORMAT)] || [], style));
			day = day.clone().add(1, "d");
			style = this.borderStyle;
		}

		return (
			<View style={{flexDirection: "row", height: "100%"}}>
				{components}
			</View>
		);
	}

	renderDayView(date, events, styles) {
		const { mode, start, end, format24h, width } = this.props;
		return (
			<DayView 
				key={date}
				date={date} 
				format24h={format24h} 
				renderEvent={this.props.renderEvent} 
				eventTapped={this.props.eventTapped} 
				events={events} 
				width={this.getSingleViewWidth({ mode, width })} 
				styles={styles} start={start} end={end} 
			/>
		);
	}

	render() {
		const { mode, styles, date, width } = this.props;
		const eventComponent =
			mode === "week"
				? this.renderWeekView()
				: this.renderDayView(date, this.state.packedEvents[date.format(DATE_FORMAT)] || [], styles);
		return (
			<ScrollView
				ref={ref => (this._scrollView = ref)}
				contentContainerStyle={[styles.contentStyle, { width }]}
				onLayout={e => (this._scrollViewHeight = e.nativeEvent.layout.height)}
			>
				{this._renderLines()}
				<View style={{ marginLeft: LEFT_MARGIN, marginRight: LEFT_MARGIN }}>
					{eventComponent}
				</View>
			</ScrollView>
		);
	}
}
