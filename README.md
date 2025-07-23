# PT-签到
PT站点签到，兼容大部分 NexusPHP，不兼容任何有验证的

| 功能       | 说明                                                        |
| -------- | --------------------------------------------------------- |
| **真正签到** | 抓取签到按钮的 `form-hash` + 提交 `POST attendance.php`，不再简单 GET。  |
| **日志清晰** | 每条日志含时间、站点、成功/失败原因、响应码、响应摘要。                              |
| **可靠推送** | 支持多种 webhook 格式（Bark / Server酱 / 自定义 POST）；失败立即推送，成功可选静默。 |
| **灵活配置** | 重试次数、代理、UA、推送密钥全部走环境变量。                                   |
| **断点续签** | 单个站点失败不影响后续站点。                                            |

1. 安装依赖
青龙 → 依赖管理 → 新建
复制
axios
https-proxy-agent

2.填入变量
| 变量                 | 示例值                          | 备注                     |
| ------------------ | ---------------------------- | ---------------------- |
| `PT_SITE_HDKYL_CK` | `uid=123; pass=xxxx;`        | hdkyl cookie           |
| `PT_SITE_CARPT_CK` | `uid=456; pass=yyyy;`        | carpt cookie           |
| `PT_WEBHOOK_URL`   | `https://api.day.app/XXXXX/` | Bark                   |
| `PT_WEBHOOK_TYPE`  | `bark`                       | 可选 bark / sct / custom |
| `PT_PROXY`         | `http://127.0.0.1:7890`      | 可选                     |

