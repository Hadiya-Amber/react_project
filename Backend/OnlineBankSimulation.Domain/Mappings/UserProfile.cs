using AutoMapper;
using OnlineBank.Core.DTOs.UserDtos;
using OnlineBank.Core.Models;

namespace OnlineBank.Core.Mappings
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<User, UserReadDto>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));
            CreateMap<UserCreateDto, User>();
            CreateMap<UserUpdateDto, User>();
            CreateMap<UpdateProfileDto, User>();
        }
    }
}