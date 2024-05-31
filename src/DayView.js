import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import moment from "moment";

const TEXT_LINE_HEIGHT = 17;

export default class DayView extends Component {
	_onEventTapped = (event) => {
		this.props.eventTapped(event);
	};

	_renderTimer() {
		const { styles } = this.props;
		const numberOfHours = 24;
		const numberOfQuarters = numberOfHours * 4
		const timeNowHour = moment().hour();
		const timeNowMin = moment().minutes();
		let quarters = [];

		for (let index = 0; index < numberOfQuarters; index++) {
			let hourNowIndex = timeNowHour * 4;
			if (timeNowMin > 0 && timeNowMin < 15) {
				hourNowIndex = hourNowIndex;
			} else if (timeNowMin >= 15 && timeNowMin < 30) {
				hourNowIndex = hourNowIndex + 1;
			} else if (timeNowMin >= 30 && timeNowMin < 45) {
				hourNowIndex = hourNowIndex + 2;
			} else if (timeNowMin >= 45 && timeNowMin < 60) {
				hourNowIndex = hourNowIndex + 3;
			}

			if (index === hourNowIndex) {
				quarters.push({index: index, isActive: true, isPassed: false});
			} else if (index < hourNowIndex) {
				quarters.push({index: index, isActive: false, isPassed: true});
			} else if (index > hourNowIndex) {
				quarters.push({index: index, isActive: false, isPassed: false});
			}
			
		}

		return quarters.map((item, ind) => {
			return <View style={{marginLeft: -25}} key={ind}>
				<View style={{width: 25, height: 25, paddingBottom: 2}}>
				<View style={{width: 10, height: 10, marginTop: -5, borderRadius: 60, backgroundColor: item?.isActive ? "#FF2300" : (item?.isPassed ? "#F1F1F1" : "#444440"), borderColor: item?.isPassed ? "#BFB8B7" : "",  borderWidth: item?.isPassed ? 1 : 0}} />
			</View>
			
		</View>
		})
	}

	_renderEvents() {
		const { styles, events } = this.props;
		return events.map((event, i) => {
			const style = {
				left: event.left,
				height: event.height,
				width: event.width,
				top: event.top
			};

			const eventColor = {
				backgroundColor: event.color
			};


			const eventBorderColor = { borderColor: event.borderColor, borderWidth: 2 };

			// Fixing the number of lines for the event title makes this calculation easier.
			// However it would make sense to overflow the title to a new line if needed
			const numberOfLines = Math.floor(event.height / TEXT_LINE_HEIGHT);
			const formatTime = this.props.format24h ? "HH:mm" : "hh:mm A";
			return (
				<TouchableOpacity
					activeOpacity={0.5}
					onPress={() => this._onEventTapped(event)}
					key={i}
					style={[styles.event, style, event.color && eventColor, event.borderColor && eventBorderColor]}
				>
					{this.props.renderEvent ? (
						this.props.renderEvent(event)
					) : (
						<View>
							<Text numberOfLines={1} style={styles.eventTitle}>
								{event.title || "Event"}
							</Text>
							{numberOfLines > 1 ? (
								<Text numberOfLines={numberOfLines - 1} style={[styles.eventSummary]}>
									{event.summary || " "}
								</Text>
							) : null}
							{numberOfLines > 2 ? (
								<Text style={styles.eventTimes} numberOfLines={1}>
									{moment(event.start).format(formatTime)} - {moment(event.end).format(formatTime)}
								</Text>
							) : null}
						</View>
					)}
				</TouchableOpacity>
			);
		});
	}

	_renderRedLine() {
		const offset = 100;
		const { width, styles } = this.props;
		const timeNowHour = moment().hour();
		const timeNowMin = moment().minutes();
		return (
			<View
				key={`timeNow`}
				style={[
					styles.lineNow,
					{
						top: offset * (timeNowHour - this.props.start) + (offset * timeNowMin) / 60,
						width
					}
				]}
			/>
		);
	}

	render() {
		const { styles, date, width, showQuarters } = this.props;
		const today = moment();
		const isToday = today.isSame(date, "day");
		let viewStyles = [styles.dayView, { width }];

		if (isToday) {
			viewStyles.push(styles.todayStyle);
		}

		return (
			<View style={viewStyles}>
				{showQuarters && this._renderTimer()}
				{this._renderEvents()}
				{isToday && this._renderRedLine()}
			</View>
		);
	}
}
