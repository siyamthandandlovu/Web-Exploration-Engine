# Logging with Prometheus and Grafana

# Installtions

# 1. Node Exporter

```typescript
wget https://github.com/prometheus/node_exporter/releases/download/v1.8.2/node_exporter-1.8.2.linux-amd64.tar.gz
```

```typescript
tar -zxvf node_exporter-1.8.2.linux-amd64.tar.gz
```


# 2. Prometheus
```typescript
wget https://github.com/prometheus/prometheus/releases/download/v2.53.1/prometheus-2.53.1.linux-amd64.tar.gz
```

```typescript
tar -zxvf prometheus-2.53.1.linux-amd64.tar.gz
```


# 3. Grafana

```typescript
wget https://dl.grafana.com/oss/release/grafana-11.1.0.linux-amd64.tar.gz
```

```typescript
tar -zxvf grafana-11.1.0.linux-amd64.tar.gz
```
**Start Grafana with Default configs**
```typescript
./bin/grafana-server
```

Initial password/username : admin+admin
