using Microsoft.AspNetCore.Http;

namespace FartSocial.Application.FartEvents.Requests
{
    public class UploadAudioRequest
    {
        public IFormFile File { get; set; } = default!;

        public int? DurationMs { get; set; }
    }
}
