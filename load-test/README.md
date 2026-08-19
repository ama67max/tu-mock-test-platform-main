# K6 Load Test - TU Mock Test Platform

This directory contains k6 load testing scripts to simulate 1000+ concurrent users on the TU Mock Test Platform.

## Prerequisites

Install k6:

### Windows (using Chocolatey)
```powershell
choco install k6
```

### Windows (using Scoop)
```powershell
scoop install k6
```

### macOS
```bash
brew install k6
```

### Linux
```bash
# Ubuntu/Debian
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys D5C1A1F1A9E0B926
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt update
sudo apt install k6

# Fedora/CentOS
sudo dnf install https://dl.k6.io/rpm/repo.rpm
sudo dnf install k6
```

Verify installation:
```bash
k6 version
```

## Configuration

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# Base URL of the API
BASE_URL=http://localhost:5000/api/v1

# Environment tag
ENVIRONMENT=staging
```

### Test Users

Update the `TEST_USERS` array in `load-test.js` with valid test user credentials:

```javascript
const TEST_USERS = [
  { email: 'testuser1@example.com', password: 'TestPass123!' },
  { email: 'testuser2@example.com', password: 'TestPass123!' },
  // Add more test users...
];
```

### Exam IDs

Update the `SAMPLE_EXAM_IDS` array with valid exam IDs from your database:

```javascript
const SAMPLE_EXAM_IDS = [
  'exam-001',
  'exam-002',
  // Add more exam IDs...
];
```

## Running Tests

### Basic Load Test
```bash
k6 run load-test.js
```

### With Environment Variables
```bash
k6 run -e BASE_URL=http://localhost:5000/api/v1 -e ENVIRONMENT=staging load-test.js
```

### Run with Output to File
```bash
k6 run --out json=results.json load-test.js
```

### Run with InfluxDB + Grafana Visualization
```bash
k6 run --out influxdb=http://localhost:8086/k6 load-test.js
```

## Test Scenarios

The load test simulates realistic user behavior with the following distribution:

| Behavior | Weight | Description |
|----------|--------|-------------|
| Browse Exams | 25% | Browse exam listings and details |
| Take Exam | 35% | Start exam, answer questions, submit |
| View Results | 20% | View exam results and attempt details |
| Browse Leaderboard | 10% | Check leaderboard rankings |
| Mixed Activity | 10% | Combined browsing and exam-taking |

## Load Profile

The test uses a staged approach:

```
Time    | Users
--------|-------
0-2m    | 0 → 500 (ramp-up)
2-5m    | 500 → 1000 (ramp-up)
5-6m    | 1000 → 1200 (spike)
6-11m   | 1200 → 1000 → 1000 (sustained)
11-13m  | 1000 → 0 (ramp-down)
```

Total duration: ~13 minutes

## Performance Thresholds

The test enforces these performance thresholds:

- **Response Time**: 95% of requests < 500ms, 99% < 1s
- **Error Rate**: < 5% failed requests
- **Throughput**: > 100 requests/second

## Optimization Features

The test includes these performance optimizations:

1. **Discard Response Bodies**: Saves RAM and reduces processing overhead
2. **Connection Reuse**: Reuses TCP connections to avoid handshake overhead
3. **Connection Batching**: Batches up to 20 connections per host
4. **Timeout Protection**: 10s timeout prevents hanging VUs

## Metrics Collected

### HTTP Metrics
- `http_req_duration`: Request duration
- `http_req_failed`: Failed request rate
- `http_reqs`: Total requests per second

### Custom Metrics
- Authentication success rate
- Exam browsing success rate
- Exam completion rate
- Result retrieval success rate

## Output Analysis

### JSON Output
```bash
# View summary statistics
k6 run --out json=results.json load-test.js

# Parse JSON with jq
cat results.json | jq 'select(.type=="Point") | select(.metric=="http_req_duration")'
```

### Console Output
The test outputs real-time metrics including:
- Request rates
- Response times (min, max, avg, percentiles)
- Error rates
- Virtual user count

## Troubleshooting

### High Error Rate
- Check API logs for errors
- Verify database connections
- Check rate limiting configuration

### High Response Times
- Monitor database query performance
- Check for N+1 query issues
- Review API caching strategy

### Connection Errors
- Increase `batch` and `batchPerHost` values
- Check system file descriptor limits
- Verify network connectivity

## Best Practices

1. **Test Data**: Ensure sufficient test users and exams exist in the database
2. **Monitoring**: Monitor server resources during the test
3. **Isolation**: Run tests in a staging environment, not production
4. **Gradual Ramp-up**: Start with lower user counts and increase
5. **Baseline**: Establish baseline metrics before making changes

## Advanced Usage

### Custom Scenarios
Modify the `BEHAVIOR_WEIGHTS` object to adjust user behavior distribution:

```javascript
const BEHAVIOR_WEIGHTS = {
  browse_exams: 0.30,
  take_exam: 0.40,
  // Adjust weights...
};
```

### Stress Testing
Modify the `stages` array for stress testing:

```javascript
stages: [
  { duration: '1m', target: 2000 }, // Aggressive ramp-up
  { duration: '5m', target: 2000 }, // Sustained high load
  { duration: '1m', target: 0 },    // Ramp-down
]
```

### Soak Testing
For long-duration stability testing:

```javascript
stages: [
  { duration: '5m', target: 500 },   // Ramp-up
  { duration: '2h', target: 500 },   // Soak at 500 users
  { duration: '5m', target: 0 },     // Ramp-down
]
```

## References

- [k6 Documentation](https://k6.io/docs/)
- [k6 JavaScript API](https://k6.io/docs/javascript-api/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/)
